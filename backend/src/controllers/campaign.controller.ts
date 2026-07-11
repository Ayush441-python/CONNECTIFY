import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

async function getOwnedBrandProfile(userId: string) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Brand profile not found');
  return profile;
}

const campaignInclude = {
  deliverables: true,
  moodboardImages: true,
  brand: { select: { id: true, brandName: true, logoUrl: true, industry: true } },
  _count: { select: { applications: true } },
} satisfies Prisma.CampaignInclude;

export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getOwnedBrandProfile(req.user!.id);
  const { title, description, category, budgetMin, budgetMax, location, deadline, creatorsNeeded, status, deliverables, moodboardImageUrls } =
    req.body;

  const campaign = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      title,
      description,
      category,
      budgetMin,
      budgetMax,
      location,
      deadline: deadline ? new Date(deadline) : undefined,
      creatorsNeeded,
      status,
      deliverables: { create: deliverables },
      moodboardImages: { create: moodboardImageUrls.map((imageUrl: string) => ({ imageUrl })) },
    },
    include: campaignInclude,
  });

  sendSuccess(res, campaign, 'Campaign created', 201);
});

export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getOwnedBrandProfile(req.user!.id);
  const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.brandId !== brand.id) throw ApiError.notFound('Campaign not found');

  const { deliverables, moodboardImageUrls, deadline, ...rest } = req.body;

  const campaign = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (deliverables) {
      await tx.campaignDeliverable.deleteMany({ where: { campaignId: existing.id } });
    }
    if (moodboardImageUrls) {
      await tx.campaignMoodboardImage.deleteMany({ where: { campaignId: existing.id } });
    }
    return tx.campaign.update({
      where: { id: existing.id },
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : undefined,
        ...(deliverables ? { deliverables: { create: deliverables } } : {}),
        ...(moodboardImageUrls ? { moodboardImages: { create: moodboardImageUrls.map((imageUrl: string) => ({ imageUrl })) } } : {}),
      },
      include: campaignInclude,
    });
  });

  sendSuccess(res, campaign, 'Campaign updated');
});

export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getOwnedBrandProfile(req.user!.id);
  const existing = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.brandId !== brand.id) throw ApiError.notFound('Campaign not found');

  await prisma.campaign.delete({ where: { id: existing.id } });
  sendSuccess(res, null, 'Campaign deleted');
});

/** GET /api/campaigns — influencer-facing browse (active campaigns only) */
export const browseCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const { category, location, search, minBudget, maxBudget } = req.query as Record<string, string>;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Number(req.query.limit) || 20);

  const where: Prisma.CampaignWhereInput = { status: 'ACTIVE' };
  if (category) where.category = category;
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (minBudget) where.budgetMax = { gte: Number(minBudget) };
  if (maxBudget) where.budgetMin = { lte: Number(maxBudget) };

  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: campaignInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ]);

  sendSuccess(res, items, 'Campaigns fetched', 200, { page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
});

/** GET /api/campaigns/mine — brand's own campaigns, any status */
export const myCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getOwnedBrandProfile(req.user!.id);
  const campaigns = await prisma.campaign.findMany({
    where: { brandId: brand.id },
    include: campaignInclude,
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, campaigns);
});

export const getCampaignById = asyncHandler(async (req: Request, res: Response) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: campaignInclude,
  });
  if (!campaign) throw ApiError.notFound('Campaign not found');
  sendSuccess(res, campaign);
});
