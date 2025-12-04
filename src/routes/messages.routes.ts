import express from 'express';
import * as messageController from '../controllers/message.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// Conversations
router.post('/conversations', messageController.getConversation);
router.get('/conversations', messageController.getConversations);

// Messages
router.post('/send', messageController.sendMessage);
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.patch('/conversations/:conversationId/read', messageController.markAsRead);

// Saved Replies
router.post('/saved-replies', messageController.createSavedReply);
router.get('/saved-replies', messageController.getSavedReplies);
router.patch('/saved-replies/:id', messageController.updateSavedReply);
router.delete('/saved-replies/:id', messageController.deleteSavedReply);

export default router;
