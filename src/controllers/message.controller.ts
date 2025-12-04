import { Request, Response, NextFunction } from 'express';
import * as messageService from '../services/message.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get or create conversation
export const getConversation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { otherUserId, listingId, bookingId } = req.body;

  // @ts-ignore
  const conversation = await messageService.getOrCreateConversation(
    req.user.id,
    otherUserId,
    listingId,
    bookingId
  );

  res.status(200).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

// Get user's conversations
export const getConversations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const conversations = await messageService.getUserConversations(req.user.id);

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: {
      conversations
    }
  });
});

// Send message
export const sendMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId, recipientId, content } = req.body;

  // @ts-ignore
  const message = await messageService.sendMessage(
    conversationId,
    req.user.id,
    recipientId,
    content
  );

  res.status(201).json({
    status: 'success',
    data: {
      message
    }
  });
});

// Get conversation messages
export const getMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  // @ts-ignore
  const messages = await messageService.getConversationMessages(
    conversationId,
    req.user.id,
    page,
    limit
  );

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages
    }
  });
});

// Mark messages as read
export const markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { conversationId } = req.params;

  // @ts-ignore
  await messageService.markMessagesAsRead(conversationId, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read'
  });
});

// Saved Replies
export const createSavedReply = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const reply = await messageService.createSavedReply(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      reply
    }
  });
});

export const getSavedReplies = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const replies = await messageService.getSavedReplies(req.user.id);

  res.status(200).json({
    status: 'success',
    results: replies.length,
    data: {
      replies
    }
  });
});

export const updateSavedReply = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const reply = await messageService.updateSavedReply(req.params.id, req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      reply
    }
  });
});

export const deleteSavedReply = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  await messageService.deleteSavedReply(req.params.id, req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
