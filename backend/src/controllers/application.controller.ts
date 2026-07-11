import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { notify } from '../services/notification.service';

async function getOwnedInfluencerProfile(userId: string) {
  const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Influencer profile not found');
  return profile;
}

async function getOwnedBrandProfile(userId: string) {
  const profile = await prisma.brandProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Brand profile not found');
  return profile;
}

/** POST /api/campaigns/:id/apply — influencer applies to an active campaign */
export const applyToCampaign = asyncHandler(async (req: Request, res: Response) => {
  const influencer = await getOwnedInfluencerProfile(req.user!.id);
  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id }, include: { brand: true } });
  if (!campaign || campaign.status !== 'ACTIVE') throw ApiError.notFound('Campaign not found or not accepting applications');

  const existing = await prisma.campaignApplication.findUnique({
    where: { campaignId_influencerId: { campaignId: campaign.id, influencerId: influencer.id } },
  });
  if (existing) throw ApiError.conflict('You have already applied to this campaign');

  const application = await prisma.campaignApplication.create({
    data: {
      campaignId: campaign.id,
      influencerId: influencer.id,
      message: req.body.message,
      expectedPrice: req.body.expectedPrice,
    },
  });

  await notify({
    userId: campaign.brand.userId,
    type: 'APPLICATION_RECEIVED',
    title: 'New campaign application',
    message: `${influencer.name} applied to "${campaign.title}"`,
    link: `/brand/campaigns/${campaign.id}/applications`,
  });

  sendSuccess(res, application, 'Application submitted', 201);
});

/** GET /api/applications/mine — influencer's own applications */
export const myApplications = asyncHandler(async (req: Request, res: Response) => {
  const influencer = await getOwnedInfluencerProfile(req.user!.id);
  const applications = await prisma.campaignApplication.findMany({
    where: { influencerId: influencer.id },
    include: { campaign: { include: { brand: { select: { brandName: true, logoUrl: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, applications);
});

/** GET /api/campaigns/:id/applications — brand views applicants for one of their campaigns */
export const campaignApplications = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getOwnedBrandProfile(req.user!.id);
  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!campaign || campaign.brandId !== brand.id) throw ApiError.notFound('Campaign not found');

  const applications = await prisma.campaignApplication.findMany({
    where: { campaignId: campaign.id },
    include: {
      influencer: {
        include: { portfolioImages: { where: { featured: true }, take: 3 } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, applications);
});

async function respondToApplication(applicationId: string, brandUserId: string, accept: boolean) {
  const brand = await getOwnedBrandProfile(brandUserId);
  const application = await prisma.campaignApplication.findUnique({
    where: { id: applicationId },
    include: { campaign: true, influencer: true },
  });
  if (!application || application.campaign.brandId !== brand.id) throw ApiError.notFound('Application not found');
  if (application.status !== 'PENDING') throw ApiError.conflict('This application has already been reviewed');

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const app = await tx.campaignApplication.update({
      where: { id: applicationId },
      data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
    });

    if (accept) {
      await tx.collaboration.create({
        data: {
          brandId: brand.id,
          influencerId: application.influencerId,
          campaignId: application.campaignId,
          applicationId: application.id,
        },
      });
    }

    return app;
  });

  await notify({
    userId: application.influencer.userId,
    type: accept ? 'APPLICATION_ACCEPTED' : 'APPLICATION_REJECTED',
    title: accept ? 'Application accepted' : 'Application update',
    message: accept
      ? `Your application to "${application.campaign.title}" was accepted. A workspace has been created.`
      : `Your application to "${application.campaign.title}" was not accepted this time.`,
    link: accept ? '/influencer/requests' : `/campaign/${application.campaignId}`,
  });

  return updated;
}

export const acceptApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await respondToApplication(req.params.id, req.user!.id, true);
  sendSuccess(res, application, 'Application accepted — a collaboration workspace has been created');
});

export const rejectApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await respondToApplication(req.params.id, req.user!.id, false);
  sendSuccess(res, application, 'Application rejected');
});
