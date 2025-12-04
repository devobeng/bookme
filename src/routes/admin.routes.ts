import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/reactivate', adminController.reactivateUser);

// Host Verification
router.get('/verifications/pending', adminController.getPendingVerifications);
router.patch('/verifications/:id/approve', adminController.verifyHost);

// Listing Approvals
router.get('/listings/pending', adminController.getPendingListings);
router.patch('/listings/:id/approve', adminController.approveListing);
router.patch('/listings/:id/reject', adminController.rejectListing);

// Reports & Disputes
router.get('/reports', adminController.getReports);
router.patch('/reports/:id/assign', adminController.assignReport);
router.patch('/reports/:id/resolve', adminController.resolveReport);

// Financial Dashboard
router.get('/financial/stats', adminController.getFinancialStats);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Fraud Prevention
router.get('/fraud/alerts', adminController.getFraudAlerts);

// Manual Refunds
router.post('/refunds/manual', adminController.processManualRefund);

export default router;
