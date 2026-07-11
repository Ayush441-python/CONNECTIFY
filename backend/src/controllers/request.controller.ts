import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { notify } from '../services/notification.service';
import { uploadBuffer } from '../services/cloudinary.service';

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

// ---------------- Collaboration Requests ----------------

/** POST /api/requests — brand invites a creator directly */
export const sendCollaborationRequest = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getOwnedBrandProfile(req.user!.id);
  const { influencerId, campaignName, message, budget, deliverables } = req.body;

  const influencer = await prisma.influencerProfile.findUnique({ where: { id: influencerId } });
  if (!influencer) throw ApiError.notFound('Creator not found');

  const request = await prisma.collaborationRequest.create({
    data: { brandId: brand.id, influencerId, campaignName, message, budget, deliverables },
  });

  await notify({
    userId: influencer.userId,
    type: 'REQUEST_RECEIVED',
    title: 'New collaboration request',
    message: `${brand.brandName} wants to collaborate with you on "${campaignName}"`,
    link: '/influencer/requests',
  });

  sendSuccess(res, request, 'Request sent', 201);
});

/** GET /api/requests/mine — role-aware: brand sees sent, influencer sees received */
export const myCollaborationRequests = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role === 'BRAND') {
    const brand = await getOwnedBrandProfile(req.user!.id);
    const requests = await prisma.collaborationRequest.findMany({
      where: { brandId: brand.id },
      include: { influencer: { select: { name: true, username: true, profilePhotoUrl: true, tier: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, requests);
  }

  const influencer = await getOwnedInfluencerProfile(req.user!.id);
  const requests = await prisma.collaborationRequest.findMany({
    where: { influencerId: influencer.id },
    include: { brand: { select: { brandName: true, logoUrl: true, industry: true } } },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, requests);
});

async function respondToRequest(requestId: string, influencerUserId: string, accept: boolean) {
  const influencer = await getOwnedInfluencerProfile(influencerUserId);
  const request = await prisma.collaborationRequest.findUnique({
    where: { id: requestId },
    include: { brand: true },
  });
  if (!request || request.influencerId !== influencer.id) throw ApiError.notFound('Request not found');
  if (request.status !== 'PENDING') throw ApiError.conflict('This request has already been reviewed');

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const req_ = await tx.collaborationRequest.update({
      where: { id: requestId },
      data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
    });

    if (accept) {
      await tx.collaboration.create({
        data: {
          brandId: request.brandId,
          influencerId: request.influencerId,
          requestId: request.id,
          notes: request.message,
        },
      });
    }
    return req_;
  });

  await notify({
    userId: request.brand.userId,
    type: accept ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
    title: accept ? 'Request accepted' : 'Request update',
    message: accept
      ? `${influencer.name} accepted your collaboration request for "${request.campaignName}"`
      : `${influencer.name} declined your collaboration request for "${request.campaignName}"`,
    link: accept ? '/brand/campaigns' : '/brand/discover',
  });

  return updated;
}

export const acceptCollaborationRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await respondToRequest(req.params.id, req.user!.id, true);
  sendSuccess(res, request, 'Request accepted — a collaboration workspace has been created');
});

export const rejectCollaborationRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await respondToRequest(req.params.id, req.user!.id, false);
  sendSuccess(res, request, 'Request declined');
});

// ---------------- Collaboration Workspace ----------------

const collaborationInclude = {
  brand: { select: { id: true, brandName: true, logoUrl: true, userId: true } },
  influencer: { select: { id: true, name: true, username: true, profilePhotoUrl: true, userId: true } },
  campaign: true,
  files: { orderBy: { createdAt: 'desc' as const } },
};

async function assertParticipant(collaborationId: string, userId: string) {
  const collab = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: collaborationInclude,
  });
  if (!collab) throw ApiError.notFound('Collaboration not found');
  if (collab.brand.userId !== userId && collab.influencer.userId !== userId) {
    throw ApiError.forbidden('You are not part of this collaboration');
  }
  return collab;
}

/** GET /api/collaborations/mine */
export const myCollaborations = asyncHandler(async (req: Request, res: Response) => {
  const where =
    req.user!.role === 'BRAND'
      ? { brand: { userId: req.user!.id } }
      : { influencer: { userId: req.user!.id } };

  const collaborations = await prisma.collaboration.findMany({
    where,
    include: collaborationInclude,
    orderBy: { updatedAt: 'desc' },
  });
  sendSuccess(res, collaborations);
});

export const getCollaboration = asyncHandler(async (req: Request, res: Response) => {
  const collab = await assertParticipant(req.params.id, req.user!.id);
  sendSuccess(res, collab);
});

export const updateCollaboration = asyncHandler(async (req: Request, res: Response) => {
  await assertParticipant(req.params.id, req.user!.id);
  const { notes, deadline, status } = req.body;

  const updated = await prisma.collaboration.update({
    where: { id: req.params.id },
    data: { notes, status, deadline: deadline ? new Date(deadline) : undefined },
    include: collaborationInclude,
  });
  sendSuccess(res, updated, 'Workspace updated');
});

export const uploadCollaborationFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file provided');
  await assertParticipant(req.params.id, req.user!.id);

  const { url } = await uploadBuffer(req.file.buffer, 'collaboration-files');
  const file = await prisma.collaborationFile.create({
    data: {
      collaborationId: req.params.id,
      fileUrl: url,
      name: req.file.originalname,
      uploadedById: req.user!.id,
    },
  });
  sendSuccess(res, file, 'File shared', 201);
});
