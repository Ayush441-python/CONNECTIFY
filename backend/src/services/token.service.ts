import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { config } from '../config';
import prisma from '../config/db';
import { AccessTokenPayload } from '../types';

export function signAccessToken(userId: string, role: Role): string {
  const payload: AccessTokenPayload = { userId, role };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
}

export function signGoogleSignupToken(payload: { googleId: string; email: string; name?: string; picture?: string }): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: '15m',
  } as jwt.SignOptions);
}

export function verifyGoogleSignupToken(token: string): { googleId: string; email: string; name?: string; picture?: string } {
  return jwt.verify(token, config.jwt.accessSecret) as { googleId: string; email: string; name?: string; picture?: string };
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Issues a new opaque refresh token, persists its hash, and returns the raw token
 * (the raw value is only ever sent to the client via httpOnly cookie — never stored).
 */
export async function issueRefreshToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt,
    },
  });

  return raw;
}

/**
 * Validates a raw refresh token, rotates it (revokes old, issues new), and returns
 * the new raw refresh token along with the user it belongs to.
 */
export async function rotateRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.revoked || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revoked: true },
  });

  const newRaw = await issueRefreshToken(record.userId);

  return { user: record.user, refreshToken: newRaw };
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}
