import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/webhook/paystack', paymentController.paystackWebhook);
router.get('/verify', paymentController.verifyPayment);

// Utility
router.get('/convert-currency', paymentController.convertCurrency);

// Protected routes
router.use(authMiddleware.protect);

// Payment operations
router.post('/initialize', paymentController.initializePayment);
router.post('/refund', paymentController.processRefund);

// Transaction history
router.get('/transactions', paymentController.getMyTransactions);
router.get('/host-transactions', paymentController.getHostTransactions);

// Host payouts
router.post('/payout', paymentController.processHostPayout);

export default router;
