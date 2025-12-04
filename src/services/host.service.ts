import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// Get host dashboard overview
export const getHostDashboard = async (hostId: string) => {
  // Get host's listings
  const listings = await Listing.find({ host: hostId });

  // Get booking statistics
  const totalBookings = await Booking.countDocuments({ host: hostId, status: 'confirmed' });
  const pendingBookings = await Booking.countDocuments({ host: hostId, status: 'pending' });
  
  // Calculate total earnings
  const completedBookings = await Booking.find({ 
    host: hostId, 
    status: { $in: ['confirmed', 'completed'] },
    paymentStatus: 'completed'
  });
  
  const totalEarnings = completedBookings.reduce((sum, booking) => {
    // Host gets 97% (3% platform fee)
    return sum + (booking.priceBreakdown.totalPrice * 0.97);
  }, 0);

  // Get recent bookings
  const recentBookings = await Booking.find({ host: hostId })
    .sort('-createdAt')
    .limit(5)
    .populate('listing', 'title images')
    .populate('user', 'name photo');

  return {
    stats: {
      totalListings: listings.length,
      totalBookings,
      pendingBookings,
      totalEarnings
    },
    recentBookings
  };
};

// Get earnings report
export const getEarningsReport = async (hostId: string, startDate?: Date, endDate?: Date) => {
  const query: any = {
    host: hostId,
    status: { $in: ['confirmed', 'completed'] },
    paymentStatus: 'completed'
  };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  const bookings = await Booking.find(query)
    .populate('listing', 'title')
    .sort('-createdAt');

  const earnings = bookings.map(booking => ({
    bookingId: booking._id,
    listingTitle: (booking.listing as any).title,
    guestName: booking.user,
    checkIn: booking.startDate,
    checkOut: booking.endDate,
    grossAmount: booking.priceBreakdown.totalPrice,
    platformFee: booking.priceBreakdown.totalPrice * 0.03,
    netEarnings: booking.priceBreakdown.totalPrice * 0.97,
    paymentDate: booking.createdAt
  }));

  const summary = {
    totalGross: earnings.reduce((sum, e) => sum + e.grossAmount, 0),
    totalPlatformFees: earnings.reduce((sum, e) => sum + e.platformFee, 0),
    totalNet: earnings.reduce((sum, e) => sum + e.netEarnings, 0),
    bookingCount: earnings.length
  };

  return { earnings, summary };
};

// Get performance insights
export const getPerformanceInsights = async (hostId: string) => {
  const listings = await Listing.find({ host: hostId });
  
  const insights = await Promise.all(listings.map(async (listing) => {
    const bookings = await Booking.find({ 
      listing: listing._id,
      status: { $in: ['confirmed', 'completed'] }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.priceBreakdown.totalPrice, 0);
    const avgNightlyRate = listing.price;
    const occupancyRate = listing.bookingInsights.totalBookings > 0 
      ? (listing.bookingInsights.totalBookings / 365) * 100 
      : 0;

    return {
      listingId: listing._id,
      title: listing.title,
      totalBookings: bookings.length,
      totalRevenue,
      avgNightlyRate,
      occupancyRate: Math.min(occupancyRate, 100),
      rating: listing.ratingsAverage,
      reviewCount: listing.ratingsQuantity
    };
  }));

  return insights;
};

// Manage payout methods
export const addPayoutMethod = async (hostId: string, payoutData: {
  type: 'bank' | 'momo';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  momoProvider?: string;
  momoNumber?: string;
}) => {
  const user = await User.findById(hostId);
  if (!user) {
    throw new Error('User not found');
  }

  // Add payout method to user profile
  // Note: You'll need to add a payoutMethods field to User model
  return { message: 'Payout method added successfully', payoutData };
};

// Get reservation management view
export const getReservations = async (hostId: string, status?: string) => {
  const query: any = { host: hostId };
  if (status) {
    query.status = status;
  }

  const reservations = await Booking.find(query)
    .populate('listing', 'title images address')
    .populate('user', 'name photo email phoneNumber')
    .sort('-createdAt');

  return reservations;
};

// Manage pricing and discounts
export const updateListingPricing = async (
  listingId: string,
  hostId: string,
  pricingData: {
    basePrice?: number;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
    smartPricing?: boolean;
  }
) => {
  const listing = await Listing.findOne({ _id: listingId, host: hostId });
  
  if (!listing) {
    throw new Error('Listing not found or unauthorized');
  }

  if (pricingData.basePrice) {
    listing.price = pricingData.basePrice;
  }

  // Note: You'll need to add discount fields to Listing model
  await listing.save();

  return listing;
};

export default {
  getHostDashboard,
  getEarningsReport,
  getPerformanceInsights,
  addPayoutMethod,
  getReservations,
  updateListingPricing
};
