import { NotificationType } from '@prisma/client';
import prisma from '../config/db';
import { emitToUser } from '../socket';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function notify({ userId, type, title, message, link }: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, link },
  });
  emitToUser(userId, 'notification:new', notification);
  return notification;
}
