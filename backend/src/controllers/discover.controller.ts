import { Request, Response } from 'express';
import { Prisma, InfluencerTier, Availability } from '@prisma/client';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

/**
 * GET /api/discover
 * Query params: category, location, tier, availability, search, sort=newest|trending, page, limit
 * Powers the masonry Discover page. "trending" is approximated by application volume
 * since there's no external social-reach signal available.
 */
export const discoverCreators = asyncHandler(async (req: Request, res: Response) => {
  const { category, location, tier, availability, search, sort = 'newest' } = req.query as Record<string, string>;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Number(req.query.limit) || 20);

  const where: Prisma.InfluencerProfileWhereInput = {};

  if (category) where.categories = { has: category };
  if (tier) where.tier = tier as InfluencerTier;
  if (availability) where.availability = availability as Availability;
  if (location) {
    where.OR = [
      { city: { contains: location, mode: 'insensitive' } },
      { state: { contains: location, mode: 'insensitive' } },
      { country: { contains: location, mode: 'insensitive' } },
    ];
  }
  if (search) {
    where.OR = [
      ...(where.OR || []),
      { username: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.InfluencerProfileOrderByWithRelationInput =
    sort === 'trending' ? { applications: { _count: 'desc' } } : { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.influencerProfile.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        portfolioImages: { where: { featured: true }, take: 1 },
      },
    }),
    prisma.influencerProfile.count({ where }),
  ]);

  sendSuccess(res, items, 'Creators fetched', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

/** GET /api/discover/categories/:category — a single themed row, e.g. for "Fashion", "Trending" */
export const discoverByCategory = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.influencerProfile.findMany({
    where: { categories: { has: req.params.category } },
    orderBy: { createdAt: 'desc' },
    take: 12,
    include: { portfolioImages: { where: { featured: true }, take: 1 } },
  });
  sendSuccess(res, items);
});
