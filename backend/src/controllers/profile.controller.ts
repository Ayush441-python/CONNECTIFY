import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { uploadBuffer } from '../services/cloudinary.service';

const MAX_PORTFOLIO_IMAGES = 20;

// ---------------- Influencer profile ----------------

export const updateInfluencerProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.influencerProfile.update({
    where: { userId: req.user!.id },
    data: req.body,
  });
  sendSuccess(res, profile, 'Profile updated');
});

export const updateBrandProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.brandProfile.update({
    where: { userId: req.user!.id },
    data: req.body,
  });
  sendSuccess(res, profile, 'Profile updated');
});

export const uploadProfilePhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');
  const { url } = await uploadBuffer(req.file.buffer, 'profile-photos');

  if (req.user!.role === 'INFLUENCER') {
    const profile = await prisma.influencerProfile.update({
      where: { userId: req.user!.id },
      data: { profilePhotoUrl: url },
    });
    return sendSuccess(res, profile, 'Profile photo updated');
  }

  const profile = await prisma.brandProfile.update({
    where: { userId: req.user!.id },
    data: { logoUrl: url },
  });
  sendSuccess(res, profile, 'Logo updated');
});

export const uploadFeaturedCover = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');
  const { url } = await uploadBuffer(req.file.buffer, 'featured-covers');
  const profile = await prisma.influencerProfile.update({
    where: { userId: req.user!.id },
    data: { featuredCoverUrl: url },
  });
  sendSuccess(res, profile, 'Featured cover updated');
});

// Public creator profile lookup by username
export const getCreatorByUsername = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.influencerProfile.findUnique({
    where: { username: req.params.username },
    include: { portfolioImages: { orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] } },
  });
  if (!profile) throw ApiError.notFound('Creator not found');
  sendSuccess(res, profile);
});

// ---------------- Portfolio ----------------

export const listMyPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) throw ApiError.notFound('Profile not found');

  const images = await prisma.portfolioImage.findMany({
    where: { influencerId: profile.id },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
  sendSuccess(res, images);
});

export const addPortfolioImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');

  const profile = await prisma.influencerProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) throw ApiError.notFound('Profile not found');

  const count = await prisma.portfolioImage.count({ where: { influencerId: profile.id } });
  if (count >= MAX_PORTFOLIO_IMAGES) {
    throw ApiError.badRequest(`You can upload a maximum of ${MAX_PORTFOLIO_IMAGES} portfolio images`);
  }

  const { url } = await uploadBuffer(req.file.buffer, 'portfolio');
  const { caption, category, featured } = req.body;

  const image = await prisma.portfolioImage.create({
    data: { influencerId: profile.id, imageUrl: url, caption, category, featured: Boolean(featured) },
  });

  sendSuccess(res, image, 'Portfolio image added', 201);
});

export const updatePortfolioImage = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) throw ApiError.notFound('Profile not found');

  const image = await prisma.portfolioImage.findUnique({ where: { id: req.params.imageId } });
  if (!image || image.influencerId !== profile.id) throw ApiError.notFound('Image not found');

  const updated = await prisma.portfolioImage.update({
    where: { id: image.id },
    data: {
      caption: req.body.caption,
      category: req.body.category,
      featured: req.body.featured !== undefined ? Boolean(req.body.featured) : undefined,
    },
  });
  sendSuccess(res, updated, 'Portfolio image updated');
});

export const deletePortfolioImage = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) throw ApiError.notFound('Profile not found');

  const image = await prisma.portfolioImage.findUnique({ where: { id: req.params.imageId } });
  if (!image || image.influencerId !== profile.id) throw ApiError.notFound('Image not found');

  await prisma.portfolioImage.delete({ where: { id: image.id } });
  sendSuccess(res, null, 'Portfolio image deleted');
});
