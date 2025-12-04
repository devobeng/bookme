import Booking, { IBooking } from '../models/Booking.js';
import Listing from '../models/Listing.js';
import { updateBookingInsights } from './listing.service.js';

// Calculate price for a booking
export const calculateBookingPrice = async (
  listingId: string,
  startDate: Date,
  endDate: Date,
  guests: { adults: number; children: number; infants: number }
) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }

  // Calculate number of nights
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numberOfNights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (numberOfNights < 1) {
    throw new Error('End date must be after start date');
  }

  // Calculate base price
  const basePrice = listing.price * numberOfNights;

  // Add cleaning fee
  const cleaningFee = listing.priceBreakdown.cleaningFee || 0;

  // Calculate service fee (typically 10-15% of base price)
  const serviceFee = basePrice * 0.12;

  // Calculate tax (example: 10%)
  const taxAmount = (basePrice + cleaningFee) * 0.1;

  // Calculate total
  const totalPrice = basePrice + cleaningFee + serviceFee + taxAmount;

  return {
    numberOfNights,
    priceBreakdown: {
      basePrice,
      cleaningFee,
      serviceFee,
      taxAmount,
      totalPrice
    }
  };
};

// Create a new booking
export const createBooking = async (bookingData: Partial<IBooking>) => {
  // Validate dates
  const start = new Date(bookingData.startDate!);
  const end = new Date(bookingData.endDate!);
  
  if (start >= end) {
    throw new Error('End date must be after start date');
  }

  // Check if listing is available
  const overlappingBookings = await Booking.find({
    listing: bookingData.listing,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      {
        startDate: { $lte: end },
        endDate: { $gte: start }
      }
    ]
  });

  if (overlappingBookings.length > 0) {
    throw new Error('Listing is not available for selected dates');
  }

  // Get listing details
  const listing = await Listing.findById(bookingData.listing).populate('host');
  if (!listing) {
    throw new Error('Listing not found');
  }

  // Set host and cancellation policy from listing
  bookingData.host = listing.host._id;
  bookingData.cancellationPolicy = listing.cancellationPolicy as 'flexible' | 'moderate' | 'strict';

  // Create booking
  const booking = await Booking.create(bookingData);

  // Update booking insights if confirmed
  if (booking.status === 'confirmed') {
    await updateBookingInsights(listing._id.toString(), booking.numberOfNights);
  }

  return booking;
};

// Get all bookings for a user
export const getUserBookings = async (userId: string, status?: string) => {
  const query: any = { user: userId };
  if (status) {
    query.status = status;
  }

  return await Booking.find(query)
    .populate('listing', 'title images address price')
    .populate('host', 'name photo')
    .sort('-createdAt');
};

// Get all bookings for a host
export const getHostBookings = async (hostId: string, status?: string) => {
  const query: any = { host: hostId };
  if (status) {
    query.status = status;
  }

  return await Booking.find(query)
    .populate('listing', 'title images address')
    .populate('user', 'name photo')
    .sort('-createdAt');
};

// Get single booking
export const getBooking = async (bookingId: string) => {
  return await Booking.findById(bookingId)
    .populate('listing')
    .populate('user', 'name photo email phoneNumber')
    .populate('host', 'name photo email phoneNumber');
};

// Confirm booking (for request-to-book)
export const confirmBooking = async (bookingId: string, hostId: string) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.host.toString() !== hostId) {
    throw new Error('Unauthorized');
  }

  if (booking.bookingType !== 'request') {
    throw new Error('Only request bookings can be confirmed');
  }

  if (booking.status !== 'pending') {
    throw new Error('Booking is not pending');
  }

  booking.status = 'confirmed';
  booking.paymentStatus = 'completed';
  await booking.save();

  // Update booking insights
  await updateBookingInsights(booking.listing.toString(), booking.numberOfNights);

  return booking;
};

// Reject booking (for request-to-book)
export const rejectBooking = async (bookingId: string, hostId: string) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.host.toString() !== hostId) {
    throw new Error('Unauthorized');
  }

  if (booking.bookingType !== 'request') {
    throw new Error('Only request bookings can be rejected');
  }

  if (booking.status !== 'pending') {
    throw new Error('Booking is not pending');
  }

  booking.status = 'rejected';
  await booking.save();

  return booking;
};

// Cancel booking
export const cancelBooking = async (
  bookingId: string,
  userId: string,
  cancelledBy: 'guest' | 'host',
  reason?: string
) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Verify user is authorized to cancel
  if (cancelledBy === 'guest' && booking.user.toString() !== userId) {
    throw new Error('Unauthorized');
  }
  if (cancelledBy === 'host' && booking.host.toString() !== userId) {
    throw new Error('Unauthorized');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    throw new Error('Cannot cancel completed booking');
  }

  // Calculate refund
  const { refundAmount, refundPercentage } = booking.calculateRefund();

  // Update booking
  booking.status = 'cancelled';
  booking.cancellationDetails = {
    cancelledAt: new Date(),
    cancelledBy,
    reason,
    refundAmount,
    refundPercentage
  };

  if (refundAmount > 0) {
    booking.paymentStatus = 'refunded';
  }

  await booking.save();

  return booking;
};

// Get booking itinerary
export const getItinerary = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId)
    .populate('listing')
    .populate('user', 'name photo email phoneNumber')
    .populate('host', 'name photo email phoneNumber');

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.user._id.toString() !== userId && booking.host._id.toString() !== userId) {
    throw new Error('Unauthorized');
  }

  return booking;
};
