import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// POST /api/v1/bookings/calculate-price
router.post('/calculate-price', bookingController.calculatePrice);

// POST /api/v1/bookings (create booking - instant or request)
router.post('/', bookingController.createBooking);

// GET /api/v1/bookings/my-bookings (guest's bookings)
router.get('/my-bookings', bookingController.getMyBookings);

// GET /api/v1/bookings/host-bookings (host's reservation inbox)
router.get('/host-bookings', bookingController.getHostBookings);

// GET /api/v1/bookings/:id (itinerary / booking details)
router.get('/:id', bookingController.getBooking);

// PATCH /api/v1/bookings/:id/confirm (host confirms request-to-book)
router.patch('/:id/confirm', bookingController.confirmBooking);

// PATCH /api/v1/bookings/:id/reject (host rejects request-to-book)
router.patch('/:id/reject', bookingController.rejectBooking);

// PATCH /api/v1/bookings/:id/cancel (cancel booking with refund calculation)
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;
