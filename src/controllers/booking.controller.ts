import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Calculate booking price
export const calculatePrice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { listingId, startDate, endDate, guests } = req.body;

  const priceData = await bookingService.calculateBookingPrice(
    listingId,
    new Date(startDate),
    new Date(endDate),
    guests
  );

  res.status(200).json({
    status: 'success',
    data: priceData
  });
});

// Create booking
export const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.body.user = req.user.id;

  // Calculate price first
  const priceData = await bookingService.calculateBookingPrice(
    req.body.listing,
    new Date(req.body.startDate),
    new Date(req.body.endDate),
    req.body.guests
  );

  // Add price data to booking
  req.body.numberOfNights = priceData.numberOfNights;
  req.body.priceBreakdown = priceData.priceBreakdown;

  const booking = await bookingService.createBooking(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// Get user's bookings (guest perspective)
export const getMyBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const bookings = await bookingService.getUserBookings(req.user.id, req.query.status as string);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// Get host's bookings (host perspective - reservation inbox)
export const getHostBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const bookings = await bookingService.getHostBookings(req.user.id, req.query.status as string);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// Get single booking / itinerary
export const getBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const booking = await bookingService.getItinerary(req.params.id, req.user.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// Confirm booking (host action for request-to-book)
export const confirmBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const booking = await bookingService.confirmBooking(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Booking confirmed successfully',
    data: {
      booking
    }
  });
});

// Reject booking (host action for request-to-book)
export const rejectBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const booking = await bookingService.rejectBooking(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Booking rejected',
    data: {
      booking
    }
  });
});

// Cancel booking (guest or host)
export const cancelBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { cancelledBy, reason } = req.body;
  
  // @ts-ignore
  const booking = await bookingService.cancelBooking(
    req.params.id,
    // @ts-ignore
    req.user.id,
    cancelledBy,
    reason
  );

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking,
      refund: booking.cancellationDetails
    }
  });
});
