import Notification from '../models/Notification.js';
import * as emailService from './email.service.js';
import * as pushService from './push.service.js';
import User from '../models/User.js';

// Create notification
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any,
  channels: Array<'email' | 'push' | 'in-app'> = ['in-app']
) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    data,
    channels
  });

  // Send via different channels
  const user = await User.findById(userId);
  if (!user) return notification;

  // Email notification
  if (channels.includes('email') && user.email) {
    const emailSent = await emailService.sendEmail({
      to: user.email,
      subject: title,
      html: `<p>${message}</p>`
    });
    notification.emailSent = emailSent;
  }

  // Push notification
  if (channels.includes('push') && user.deviceToken) {
    const pushSent = await pushService.sendPushNotification(user.deviceToken, {
      title,
      body: message,
      data
    });
    notification.pushSent = pushSent;
  }

  await notification.save();
  return notification;
};

// Get user notifications
export const getUserNotifications = async (userId: string, unreadOnly: boolean = false) => {
  const query: any = { user: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  return await Notification.find(query)
    .sort('-createdAt')
    .limit(50);
};

// Mark notification as read
export const markAsRead = async (notificationId: string, userId: string) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

// Mark all as read
export const markAllAsRead = async (userId: string) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Delete notification
export const deleteNotification = async (notificationId: string, userId: string) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId
  });
};

// Notification helpers for specific events

// Booking notifications
export const sendBookingConfirmationNotification = async (
  userId: string,
  bookingDetails: any
) => {
  await createNotification(
    userId,
    'booking',
    'Booking Confirmed!',
    `Your booking for ${bookingDetails.listingTitle} has been confirmed.`,
    bookingDetails,
    ['email', 'push', 'in-app']
  );
};

export const sendBookingRequestNotification = async (
  hostId: string,
  bookingDetails: any
) => {
  await createNotification(
    hostId,
    'booking',
    'New Booking Request',
    `You have a new booking request for ${bookingDetails.listingTitle}.`,
    bookingDetails,
    ['email', 'push', 'in-app']
  );
};

// Payment notifications
export const sendPaymentConfirmationNotification = async (
  userId: string,
  paymentDetails: any
) => {
  await createNotification(
    userId,
    'payment',
    'Payment Confirmed',
    `Your payment of GHS ${paymentDetails.amount} has been processed.`,
    paymentDetails,
    ['email', 'in-app']
  );
};

// Review notifications
export const sendReviewReminderNotification = async (
  userId: string,
  bookingDetails: any
) => {
  await createNotification(
    userId,
    'review',
    'Share Your Experience',
    `How was your stay at ${bookingDetails.listingTitle}?`,
    bookingDetails,
    ['email', 'push', 'in-app']
  );
};

export const sendNewReviewNotification = async (
  hostId: string,
  reviewDetails: any
) => {
  await createNotification(
    hostId,
    'review',
    'New Review Received',
    `You received a ${reviewDetails.rating}-star review for ${reviewDetails.listingTitle}.`,
    reviewDetails,
    ['email', 'push', 'in-app']
  );
};

// Message notifications
export const sendNewMessageNotification = async (
  userId: string,
  messageDetails: any
) => {
  await createNotification(
    userId,
    'message',
    `New message from ${messageDetails.senderName}`,
    messageDetails.message.substring(0, 100),
    messageDetails,
    ['email', 'push', 'in-app']
  );
};

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBookingConfirmationNotification,
  sendBookingRequestNotification,
  sendPaymentConfirmationNotification,
  sendReviewReminderNotification,
  sendNewReviewNotification,
  sendNewMessageNotification
};
