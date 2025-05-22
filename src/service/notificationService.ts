import { prismaClient } from "../lib/prismaClient";

export const getNotificationsByUserId = async(userId : string) =>{
  return await prismaClient.notification.findMany({
    where : { userId : 1},
    orderBy : {createdAt : 'desc'},
  });
}