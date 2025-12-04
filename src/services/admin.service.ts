import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import Report from '../models/Report.js';
import Review from '../models/Review.js';

// User Management
export const getAllUsers = async (filters?: any) => {
  const query: any = {};
  
  if (filters?.role) query.role = filters.role;
  if (filters?.isIdVerified !== undefined) query.isIdVerified = filters.isIdVerified;
  
  return await User.find(query)
    .select('-password')
    .sort('-createdAt');
};

export const getUserById = async (userId: string) => {
  return await User.findById(userId).select('-password');
};

export const updateUserRole = async (userId: string, role: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password');
};

export const suspendUser = async (userId: string, reason: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { 
      active: false,
      suspensionReason: reason,
      suspendedAt: new Date()
    },
    { new: true }
  ).select('-password');
};

export const reactivateUser = async (userId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { 
      active: true,
      $unset: { suspensionReason: 1, suspendedAt: 1 }
    },
    { new: true }
  ).select('-password');
};

// Host Verification
export const verifyHost = async (userId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { isIdVerified: true },
    { new: true }
  ).select('-password');
};

export const getPendingHostVerifications = async () => {
  return await User.find({
    role: 'host',
    isIdVerified: false
  }).select('-password');
};

// Listing Management
export const getPendingListings = async () => {
  return await Listing.find({ status: 'pending' })
    .populate('host', 'name email');
};

export const approveListing = async (listingId: string) => {
  return await Listing.findByIdAndUpdate(
    listingId,
    { status: 'approved', approvedAt: new Date() },
    { new: true }
  );
};

export const rejectListing = async (listingId: string, reason: string) => {
  return await Listing.findByIdAndUpdate(
    listingId,
    { 
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date()
    },
    { new: true }
  );
};

// Reports & Disputes
export const getAllReports = async (status?: string) => {
  const query: any = {};
  if (status) query.status = status;

  return await Report.find(query)
    .populate('reportedBy', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedListing', 'title')
    .populate('assignedTo', 'name')
    .sort('-createdAt');
};

export const assignReport = async (reportId: string, adminId: string) => {
  return await Report.findByIdAndUpdate(
    reportId,
    { assignedTo: adminId, status: 'investigating' },
    { new: true }
  );
};

export const resolveReport = async (reportId: string, resolution: string) => {
  return await Report.findByIdAndUpdate(
    reportId,
    { 
      status: 'resolved',
      resolution,
      resolvedAt: new Date()
    },
    { new: true }
  );
};

// Financial Dashboard
export const getFinancialStats = async (startDate?: Date, endDate?: Date) => {
  const query: any = { status: 'completed' };
  
  if (startDate || endDate) {
    query.completedAt = {};
    if (startDate) query.completedAt.$gte = startDate;
    if (endDate) query.completedAt.$lte = endDate;
  }

  const transactions = await Transaction.find(query);

  const stats = {
    totalRevenue: 0,
    totalPayments: 0,
    totalPayouts: 0,
    totalRefunds: 0,
    platformFees: 0,
    transactionCount: transactions.length
  };

  transactions.forEach(txn => {
    if (txn.type === 'payment') {
      stats.totalPayments += txn.amount;
      stats.totalRevenue += txn.amount;
      stats.platformFees += txn.breakdown?.platformFee || 0;
    } else if (txn.type === 'payout') {
      stats.totalPayouts += txn.amount;
    } else if (txn.type === 'refund') {
      stats.totalRefunds += txn.amount;
    }
  });

  return stats;
};

// Analytics
export const getPlatformAnalytics = async () => {
  const [
    totalUsers,
    totalHosts,
    totalListings,
    totalBookings,
    activeListings,
    completedBookings
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'host' }),
    Listing.countDocuments(),
    Booking.countDocuments(),
    Listing.countDocuments({ status: 'approved' }),
    Booking.countDocuments({ status: 'completed' })
  ]);

  // Get growth metrics (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const [newUsers, newListings, newBookings] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Listing.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
  ]);

  return {
    overview: {
      totalUsers,
      totalHosts,
      totalListings,
      totalBookings,
      activeListings,
      completedBookings
    },
    growth: {
      newUsers,
      newListings,
      newBookings,
      period: '30 days'
    }
  };
};

// Fraud Prevention
export const getFraudAlerts = async () => {
  // Find suspicious activities
  const suspiciousUsers = await User.find({
    $or: [
      { failedLoginAttempts: { $gte: 5 } },
      { reportCount: { $gte: 3 } }
    ]
  }).select('name email failedLoginAttempts reportCount');

  const suspiciousBookings = await Booking.find({
    status: 'cancelled',
    'cancellationDetails.cancelledBy': 'guest'
  }).limit(20).populate('user', 'name email');

  return {
    suspiciousUsers,
    suspiciousBookings
  };
};

// Manual Refund
export const processManualRefund = async (
  bookingId: string,
  amount: number,
  reason: string,
  adminId: string
) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Create refund transaction
  const refund = await Transaction.create({
    booking: bookingId,
    user: booking.user,
    host: booking.host,
    type: 'refund',
    amount,
    currency: 'GHS',
    paymentMethod: 'bank-transfer',
    status: 'completed',
    completedAt: new Date(),
    metadata: {
      reason,
      processedBy: adminId,
      manual: true
    }
  });

  // Update booking
  await Booking.findByIdAndUpdate(bookingId, {
    paymentStatus: 'refunded'
  });

  return refund;
};

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  suspendUser,
  reactivateUser,
  verifyHost,
  getPendingHostVerifications,
  getPendingListings,
  approveListing,
  rejectListing,
  getAllReports,
  assignReport,
  resolveReport,
  getFinancialStats,
  getPlatformAnalytics,
  getFraudAlerts,
  processManualRefund
};
