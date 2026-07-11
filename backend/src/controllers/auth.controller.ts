import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { config } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  signAccessToken,
} from '../services/token.service';
import { sendEmail, verificationEmailHtml, resetPasswordEmailHtml } from '../services/email.service';

const REFRESH_COOKIE = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: (config.isProd ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}

function publicUser(user: {
  id: string;
  email: string;
  mobile: string | null;
  role: string;
  isEmailVerified: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

async function issueSession(res: Response, userId: string, role: 'BRAND' | 'INFLUENCER' | 'ADMIN') {
  const accessToken = signAccessToken(userId, role);
  const refreshToken = await issueRefreshToken(userId);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

// ---------------- Register ----------------

export const registerInfluencer = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, mobile, name, username, instagramUsername, city, state, country, categories, languages, tier, availability } =
    req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const existingUsername = await prisma.influencerProfile.findUnique({ where: { username } });
  if (existingUsername) throw ApiError.conflict('This username is already taken');

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        mobile: mobile || undefined,
        role: 'INFLUENCER',
        emailVerifyToken,
        emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        influencerProfile: {
          create: {
            name,
            username,
            instagramUsername,
            city,
            state,
            country,
            categories,
            languages,
            tier,
            availability,
          },
        },
      },
      include: { influencerProfile: true },
    });
    return created;
  });

  const verifyUrl = `${config.clientUrl}/verify-email/${emailVerifyToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Connectify account',
    html: verificationEmailHtml(name, verifyUrl),
  }).catch(() => undefined);

  const accessToken = await issueSession(res, user.id, user.role);

  sendSuccess(
    res,
    { user: publicUser(user), profile: user.influencerProfile, accessToken },
    'Account created',
    201
  );
});

export const registerBrand = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, mobile, brandName, industry, about, website, city, state, country, preferredCategories } =
    req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    return tx.user.create({
      data: {
        email,
        password: hashedPassword,
        mobile: mobile || undefined,
        role: 'BRAND',
        emailVerifyToken,
        emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        brandProfile: {
          create: { brandName, industry, about, website, city, state, country, preferredCategories },
        },
      },
      include: { brandProfile: true },
    });
  });

  const verifyUrl = `${config.clientUrl}/verify-email/${emailVerifyToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Connectify account',
    html: verificationEmailHtml(brandName, verifyUrl),
  }).catch(() => undefined);

  const accessToken = await issueSession(res, user.id, user.role);

  sendSuccess(res, { user: publicUser(user), profile: user.brandProfile, accessToken }, 'Account created', 201);
});

// ---------------- Login / Session ----------------

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { influencerProfile: true, brandProfile: true },
  });

  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (user.isSuspended) throw ApiError.forbidden('This account has been suspended');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const accessToken = await issueSession(res, user.id, user.role);

  sendSuccess(res, {
    user: publicUser(user),
    profile: user.role === 'INFLUENCER' ? user.influencerProfile : user.role === 'BRAND' ? user.brandProfile : null,
    accessToken,
  }, 'Logged in');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token provided');

  const rotated = await rotateRefreshToken(token);
  if (!rotated) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    throw ApiError.unauthorized('Session expired, please log in again');
  }

  const { user, refreshToken } = rotated;
  if (user.isSuspended) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    throw ApiError.forbidden('This account has been suspended');
  }

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  const accessToken = signAccessToken(user.id, user.role);

  sendSuccess(res, { user: publicUser(user), accessToken }, 'Session refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await revokeRefreshToken(token);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  sendSuccess(res, null, 'Logged out');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { influencerProfile: true, brandProfile: true },
  });
  if (!user) throw ApiError.notFound('User not found');

  sendSuccess(res, {
    user: publicUser(user),
    profile: user.role === 'INFLUENCER' ? user.influencerProfile : user.role === 'BRAND' ? user.brandProfile : null,
  });
});

// ---------------- Password reset ----------------

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond with success to avoid leaking which emails are registered.
  if (!user) return sendSuccess(res, null, 'If that email exists, a reset link has been sent');

  const resetToken = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Connectify password',
    html: resetPasswordEmailHtml(email, resetUrl),
  }).catch(() => undefined);

  sendSuccess(res, null, 'If that email exists, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  });

  sendSuccess(res, null, 'Password reset successfully. You can now log in.');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token, emailVerifyExpiry: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest('Verification link is invalid or has expired');

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  });

  sendSuccess(res, null, 'Email verified successfully');
});

