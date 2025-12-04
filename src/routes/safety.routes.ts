import express from 'express';
import * as safetyController from '../controllers/safety.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// User routes
router.post('/verify/id', safetyController.submitIdVerification);
router.get('/verifications', safetyController.getMyVerifications);
router.get('/trust-score', safetyController.getTrustScore);

// Emergency support
router.post('/emergency', safetyController.createEmergencyContact);

// Admin routes
router.get(
  '/admin/verifications/pending',
  authMiddleware.restrictTo('admin'),
  safetyController.getPendingVerifications
);
router.patch(
  '/admin/verifications/:id/review',
  authMiddleware.restrictTo('admin'),
  safetyController.reviewVerification
);
router.get(
  '/admin/emergency',
  authMiddleware.restrictTo('admin'),
  safetyController.getEmergencyContacts
);
router.patch(
  '/admin/emergency/:id/assign',
  authMiddleware.restrictTo('admin'),
  safetyController.assignEmergencyContact
);
router.patch(
  '/admin/emergency/:id/resolve',
  authMiddleware.restrictTo('admin'),
  safetyController.resolveEmergencyContact
);

export default router;
