import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

// ---------------- Notifications ----------------

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);

  sendSuccess(res, items, 'Notifications fetched', 200, { page, limit, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user!.id) throw ApiError.notFound('Notification not found');

  const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  sendSuccess(res, updated);
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true } });
  sendSuccess(res, null, 'All notifications marked as read');
});

// ---------------- Saved Creators (brand bookmarks influencer) ----------------

export const saveCreator = asyncHandler(async (req: Request, res: Response) => {
  const brand = await prisma.brandProfile.findUnique({ where: { userId: req.user!.id } });
  if (!brand) throw ApiError.notFound('Brand profile not found');

  const saved = await prisma.savedCreator.upsert({
    where: { brandId_influencerId: { brandId: brand.id, influencerId: req.params.influencerId } },
    create: { brandId: brand.id, influencerId: req.params.influencerId },
    update: {},
  });
  sendSuccess(res, saved, 'Creator saved', 201);
});

export const unsaveCreator = asyncHandler(async (req: Request, res: Response) => {
  const brand = await prisma.brandProfile.findUnique({ where: { userId: req.user!.id } });
  if (!brand) throw ApiError.notFound('Brand profile not found');

  await prisma.savedCreator.deleteMany({ where: { brandId: brand.id, influencerId: req.params.influencerId } });
  sendSuccess(res, null, 'Creator removed from saved list');
});

export const listSavedCreators = asyncHandler(async (req: Request, res: Response) => {
  const brand = await prisma.brandProfile.findUnique({ where: { userId: req.user!.id } });
  if (!brand) throw ApiError.notFound('Brand profile not found');

  const saved = await prisma.savedCreator.findMany({
    where: { brandId: brand.id },
    include: { influencer: { include: { portfolioImages: { where: { featured: true }, take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, saved);
});

// ---------------- Saved Campaigns (influencer bookmarks campaign) ----------------

export const saveCampaign = asyncHandler(async (req: Request, res: Response) => {
  const influencer = await prisma.influencerProfile.findUnique({ where: { userId: req.user!.id } });
  if (!influencer) throw ApiError.notFound('Influencer profile not found');

  const saved = await prisma.savedCampaign.upsert({
    where: { influencerId_campaignId: { influencerId: influencer.id, campaignId: req.params.campaignId } },
    create: { influencerId: influencer.id, campaignId: req.params.campaignId },
    update: {},
  });
  sendSuccess(res, saved, 'Campaign saved', 201);
});

export const unsaveCampaign = asyncHandler(async (req: Request, res: Response) => {
  const influencer = await prisma.influencerProfile.findUnique({ where: { userId: req.user!.id } });
  if (!influencer) throw ApiError.notFound('Influencer profile not found');

  await prisma.savedCampaign.deleteMany({ where: { influencerId: influencer.id, campaignId: req.params.campaignId } });
  sendSuccess(res, null, 'Campaign removed from saved list');
});

export const listSavedCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const influencer = await prisma.influencerProfile.findUnique({ where: { userId: req.user!.id } });
  if (!influencer) throw ApiError.notFound('Influencer profile not found');

  const saved = await prisma.savedCampaign.findMany({
    where: { influencerId: influencer.id },
    include: { campaign: { include: { brand: { select: { brandName: true, logoUrl: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, saved);
});
