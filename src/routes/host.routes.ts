import express from 'express';
import * as hostController from '../controllers/host.controller.js';
import * as listingController from '../controllers/listing.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// Dashboard Overview
router.get('/dashboard', hostController.getDashboard);

// Property Management
router.get('/listings', hostController.getMyListings);
router.post('/listings', listingController.createListing);
router.patch('/listings/:id', listingController.updateListing);
router.delete('/listings/:id', listingController.deleteListing);

// Availability Calendar
router.patch('/listings/:listingId/calendar', hostController.updateCalendar);

// Pricing Management
router.patch('/listings/:listingId/pricing', hostController.updatePricing);

// Reservation Management (Inbox)
router.get('/reservations', hostController.getReservations);

// Earnings & Payouts
router.get('/earnings', hostController.getEarnings);
router.post('/payout-methods', hostController.addPayoutMethod);

// Performance Insights
router.get('/insights', hostController.getInsights);

export default router;
