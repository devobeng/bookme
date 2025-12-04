import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

export default router;
