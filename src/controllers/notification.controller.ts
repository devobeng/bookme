import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service.js';
import catchAsync from '../utils/catchAsync.js';

// Get user notifications
export const getNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  
  // @ts-ignore
  const notifications = await notificationService.getUserNotifications(req.user.id, unreadOnly);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications
    }
  });
});

// Mark notification as read
export const markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Mark all as read
export const markAllAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  await notificationService.markAllAsRead(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

// Delete notification
export const deleteNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  await notificationService.deleteNotification(req.params.id, req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
