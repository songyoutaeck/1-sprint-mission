import ForbiddenError from "../lib/errors/ForbiddenError";
import NotFoundError from "../lib/errors/NotFoundError";
import { prismaClient } from "../lib/prismaClient";

export const getNotificationsByUserId = async(userId : string) =>{
  return await prismaClient.notification.findMany({
    where : { userId : 1},
    orderBy : {createdAt : 'desc'},
  });
}

export async function getNotifications(userId: number) {
  return await prismaClient.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function countUnreadNotifications(userId : number){
  return await prismaClient.notification.count({
    where : {
      userId,
      isRead : false,
    },
  });
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  // 알림 존재 확인
  const notification = await prismaClient.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new NotFoundError('notification', notificationId);
  if (notification.userId !== userId) throw new ForbiddenError('다른 사람의 알림입니다');

  return await prismaClient.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}