import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { register, login } from '../validation/auth.validation.js';

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', register, validate, authController.register);

// POST /api/v1/auth/login
router.post('/login', login, validate, authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Social Login
router.post('/social-login', authController.socialLogin);

// MFA Login (for users with MFA enabled)
router.post('/verify-mfa-login', authController.verifyMFALogin);

// Protected routes
router.use(authMiddleware.protect);

router.patch('/updateMyPassword', authController.updatePassword);

// Phone Verification
router.post('/send-phone-verification', authController.sendPhoneVerification);
router.post('/verify-phone', authController.verifyPhone);

// Multi-Factor Authentication
router.post('/enable-mfa', authController.enableMFA);
router.post('/verify-mfa', authController.verifyMFA);

export default router;
