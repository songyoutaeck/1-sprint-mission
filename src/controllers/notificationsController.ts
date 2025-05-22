import { Request , Response } from "express";
import { getNotificationsByUserId } from "../service/notificationService"

export const getNotifications = async(req : Request, res: Response)=>{
  const userId = req.user.id;
  const notifications = await getNotificationsByUserId(userId);
  res.json(notifications);
}