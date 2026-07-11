import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalBrands, totalInfluencers, totalCampaigns, activeCampaigns, totalApplications, totalMessages, pendingReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BRAND' } }),
      prisma.user.count({ where: { role: 'INFLUENCER' } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.campaignApplication.count(),
      prisma.message.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

  sendSuccess(res, {
    totalUsers,
    totalBrands,
    totalInfluencers,
    totalCampaigns,
    activeCampaigns,
    totalApplications,
    totalMessages,
    pendingReports,
  });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search } = req.query as Record<string, string>;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 25);

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        mobile: true,
        role: true,
        isActive: true,
        isSuspended: true,
        isEmailVerified: true,
        createdAt: true,
        influencerProfile: { select: { name: true, username: true } },
        brandProfile: { select: { brandName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  sendSuccess(res, users, 'Users fetched', 200, { page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isSuspended: true } });
  sendSuccess(res, user, 'User suspended');
});

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isSuspended: false } });
  sendSuccess(res, user, 'User activated');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'ADMIN') throw ApiError.forbidden('Admin accounts cannot be deleted from this panel');

  await prisma.user.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'User deleted');
});

export const deletePortfolioImageAdmin = asyncHandler(async (req: Request, res: Response) => {
  await prisma.portfolioImage.delete({ where: { id: req.params.imageId } });
  sendSuccess(res, null, 'Image removed');
});

export const deleteCampaignAdmin = asyncHandler(async (req: Request, res: Response) => {
  await prisma.campaign.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'Campaign removed');
});

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { email: true } },
      reportedUser: { select: { email: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, reports);
});

export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
  const report = await prisma.report.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  sendSuccess(res, report, 'Report updated');
});

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await prisma.report.create({
    data: {
      reporterId: req.user!.id,
      reportedUserId: req.body.reportedUserId,
      reason: req.body.reason,
      details: req.body.details,
    },
  });
  sendSuccess(res, report, 'Report submitted', 201);
});
