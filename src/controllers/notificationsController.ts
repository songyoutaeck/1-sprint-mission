import { Request , Response } from "express";
import { getNotificationsByUserId } from "../service/notificationService"
import UnauthorizedError from "../lib/errors/UnauthorizedError";
import * as notificationService from '../service/notificationService';
import { create } from 'superstruct';
import { IdParamsStruct } from '../structs/commonStructs';
import { markNotificationAsRead } from '../service/notificationService';



export const getNotifications = async(req : Request, res: Response)=>{
  
  const userId = req.user.id;
    if (!req.user || !req.user.id) {
    throw new UnauthorizedError('Unauthorized');
  }
  const notifications = await getNotificationsByUserId(userId);
  res.json(notifications);
}


export async function getUnreadNotificationCount(req : Request, res : Response){
  if(!req.user || !req.user.id){
    throw new UnauthorizedError('Unauthorized');
  }
  const count = await notificationService.countUnreadNotifications(req.user.id);
  res.json({unreadCount:count});
}

export async function readNotification(req: Request, res: Response) {
  if (!req.user || !req.user.id) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { id } = create(req.params, IdParamsStruct);
  const updated = await markNotificationAsRead(id, req.user.id);

  res.status(200).json(updated);
}