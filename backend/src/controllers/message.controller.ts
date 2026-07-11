import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

async function assertParticipant(collaborationId: string, userId: string) {
  const collab = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: { brand: true, influencer: true },
  });
  if (!collab) throw ApiError.notFound('Collaboration not found');
  if (collab.brand.userId !== userId && collab.influencer.userId !== userId) {
    throw ApiError.forbidden('You are not part of this collaboration');
  }
  return collab;
}

/** GET /api/collaborations/:id/messages — paginated history, oldest-first for chat rendering */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  await assertParticipant(req.params.id, req.user!.id);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 50);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { collaborationId: req.params.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where: { collaborationId: req.params.id } }),
  ]);

  sendSuccess(res, messages.reverse(), 'Messages fetched', 200, { page, limit, total });
});

/** POST /api/collaborations/:id/messages — REST fallback for sending (primary path is the socket event) */
export const sendMessageRest = asyncHandler(async (req: Request, res: Response) => {
  const collab = await assertParticipant(req.params.id, req.user!.id);
  const receiverId = collab.brand.userId === req.user!.id ? collab.influencer.userId : collab.brand.userId;

  const message = await prisma.message.create({
    data: {
      collaborationId: req.params.id,
      senderId: req.user!.id,
      receiverId,
      content: req.body.content,
      imageUrl: req.body.imageUrl,
    },
  });
  sendSuccess(res, message, 'Message sent', 201);
});

/** GET /api/messages/unread-count */
export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await prisma.message.count({ where: { receiverId: req.user!.id, isRead: false } });
  sendSuccess(res, { count });
});
