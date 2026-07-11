import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import prisma from '../config/db';
import { config } from '../config';
import { verifyAccessToken } from '../services/token.service';

let io: Server | null = null;

// userId -> count of connected sockets (a user may have multiple tabs/devices open)
const onlineUsers = new Map<string, number>();

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId: string = socket.data.userId;
    socket.join(`user:${userId}`);

    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    io!.emit('presence:update', { userId, online: true });

    socket.on('collaboration:join', (collaborationId: string) => {
      socket.join(`collab:${collaborationId}`);
    });

    socket.on('collaboration:leave', (collaborationId: string) => {
      socket.leave(`collab:${collaborationId}`);
    });

    socket.on('typing:start', ({ collaborationId }: { collaborationId: string }) => {
      socket.to(`collab:${collaborationId}`).emit('typing:start', { userId, collaborationId });
    });

    socket.on('typing:stop', ({ collaborationId }: { collaborationId: string }) => {
      socket.to(`collab:${collaborationId}`).emit('typing:stop', { userId, collaborationId });
    });

    socket.on(
      'message:send',
      async ({ collaborationId, content, imageUrl }: { collaborationId: string; content?: string; imageUrl?: string }) => {
        try {
          const collab = await prisma.collaboration.findUnique({
            where: { id: collaborationId },
            include: { brand: true, influencer: true },
          });
          if (!collab) return;

          const isBrandUser = collab.brand.userId === userId;
          const isInfluencerUser = collab.influencer.userId === userId;
          if (!isBrandUser && !isInfluencerUser) return;

          const receiverId = isBrandUser ? collab.influencer.userId : collab.brand.userId;

          const message = await prisma.message.create({
            data: { collaborationId, senderId: userId, receiverId, content, imageUrl },
          });

          io!.to(`collab:${collaborationId}`).emit('message:new', message);

          const isReceiverOnline = (onlineUsers.get(receiverId) || 0) > 0;
          if (!isReceiverOnline) {
            const notification = await prisma.notification.create({
              data: {
                userId: receiverId,
                type: 'NEW_MESSAGE',
                title: 'New message',
                message: content ? content.slice(0, 120) : 'Sent an image',
                link: `/messages/${collaborationId}`,
              },
            });
            io!.to(`user:${receiverId}`).emit('notification:new', notification);
          }
        } catch (err) {
          socket.emit('message:error', { message: 'Failed to send message' });
        }
      }
    );

    socket.on('message:read', async ({ collaborationId }: { collaborationId: string }) => {
      await prisma.message.updateMany({
        where: { collaborationId, receiverId: userId, isRead: false },
        data: { isRead: true },
      });
      socket.to(`collab:${collaborationId}`).emit('message:read', { collaborationId, readBy: userId });
    });

    socket.on('disconnect', () => {
      const remaining = Math.max(0, (onlineUsers.get(userId) || 1) - 1);
      if (remaining === 0) {
        onlineUsers.delete(userId);
        io!.emit('presence:update', { userId, online: false });
      } else {
        onlineUsers.set(userId, remaining);
      }
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function isUserOnline(userId: string): boolean {
  return (onlineUsers.get(userId) || 0) > 0;
}
