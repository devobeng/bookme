import axios from 'axios';
import Transaction from '../models/Transaction.js';
import Booking from '../models/Booking.js';
import { paystackSecretKey } from '../config/env.js';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initialize payment
export const initializePayment = async (
  userId: string,
  bookingId: string,
  amount: number,
  currency: string = 'GHS',
  paymentMethod: 'card' | 'mobile-money' = 'card'
) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== userId) {
    throw new Error('Unauthorized');
  }

  // Create transaction record
  const transaction = await Transaction.create({
    booking: bookingId,
    user: userId,
    host: booking.host,
    type: 'payment',
    amount,
    currency,
    paymentMethod,
    paymentProvider: 'paystack',
    status: 'pending',
    breakdown: {
      subtotal: booking.priceBreakdown.basePrice,
      serviceFee: booking.priceBreakdown.serviceFee,
      platformFee: booking.priceBreakdown.totalPrice * 0.03,
      total: booking.priceBreakdown.totalPrice
    }
  });

  // Initialize Paystack transaction
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: (booking.user as any).email,
        amount: amount * 100, // Convert to kobo/pesewas
        currency,
        reference: transaction._id.toString(),
        callback_url: `${process.env.FRONTEND_URL}/booking/payment/callback`,
        metadata: {
          bookingId,
          userId,
          transactionId: transaction._id.toString()
        },
        channels: paymentMethod === 'mobile-money' ? ['mobile_money'] : ['card']
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update transaction with Paystack details
    transaction.paystackReference = response.data.data.reference;
    transaction.paystackAccessCode = response.data.data.access_code;
    transaction.status = 'processing';
    await transaction.save();

    return {
      transactionId: transaction._id,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference
    };
  } catch (error: any) {
    transaction.status = 'failed';
    transaction.failureReason = error.response?.data?.message || error.message;
    await transaction.save();
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

// Verify payment
export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`
        }
      }
    );

    const paymentData = response.data.data;

    // Find transaction
    const transaction = await Transaction.findOne({ paystackReference: reference });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (paymentData.status === 'success') {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      
      // Update booking payment status
      await Booking.findByIdAndUpdate(transaction.booking, {
        paymentStatus: 'completed',
        paymentIntentId: reference
      });
    } else {
      transaction.status = 'failed';
      transaction.failureReason = paymentData.gateway_response;
    }

    await transaction.save();

    return transaction;
  } catch (error: any) {
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

// Process refund
export const processRefund = async (bookingId: string, refundAmount: number, reason: string) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Find original payment transaction
  const originalTransaction = await Transaction.findOne({
    booking: bookingId,
    type: 'payment',
    status: 'completed'
  });

  if (!originalTransaction) {
    throw new Error('Original payment transaction not found');
  }

  // Create refund transaction
  const refundTransaction = await Transaction.create({
    booking: bookingId,
    user: booking.user,
    host: booking.host,
    type: 'refund',
    amount: refundAmount,
    currency: originalTransaction.currency,
    paymentMethod: originalTransaction.paymentMethod,
    paymentProvider: 'paystack',
    status: 'processing',
    metadata: {
      originalTransactionId: originalTransaction._id,
      reason
    }
  });

  try {
    // Initiate Paystack refund
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/refund`,
      {
        transaction: originalTransaction.paystackReference,
        amount: refundAmount * 100, // Convert to kobo/pesewas
        currency: originalTransaction.currency,
        customer_note: reason
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    refundTransaction.status = 'completed';
    refundTransaction.completedAt = new Date();
    refundTransaction.paystackReference = response.data.data.id;
    await refundTransaction.save();

    // Update booking payment status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'refunded'
    });

    return refundTransaction;
  } catch (error: any) {
    refundTransaction.status = 'failed';
    refundTransaction.failureReason = error.response?.data?.message || error.message;
    await refundTransaction.save();
    throw new Error(`Refund processing failed: ${error.message}`);
  }
};

// Process payout to host
export const processHostPayout = async (
  hostId: string,
  amount: number,
  currency: string = 'GHS',
  recipientCode: string
) => {
  const transaction = await Transaction.create({
    user: hostId,
    host: hostId,
    type: 'payout',
    amount,
    currency,
    paymentMethod: 'bank-transfer',
    paymentProvider: 'paystack',
    status: 'processing'
  });

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: amount * 100,
        recipient: recipientCode,
        reason: 'Host payout for bookings'
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    transaction.status = 'completed';
    transaction.completedAt = new Date();
    transaction.paystackReference = response.data.data.transfer_code;
    await transaction.save();

    return transaction;
  } catch (error: any) {
    transaction.status = 'failed';
    transaction.failureReason = error.response?.data?.message || error.message;
    await transaction.save();
    throw new Error(`Payout processing failed: ${error.message}`);
  }
};

// Get user transaction history
export const getUserTransactions = async (userId: string, type?: string) => {
  const query: any = { user: userId };
  if (type) {
    query.type = type;
  }

  return await Transaction.find(query)
    .sort('-createdAt')
    .populate('booking', 'startDate endDate listing')
    .populate('host', 'name');
};

// Get host transaction history
export const getHostTransactions = async (hostId: string, type?: string) => {
  const query: any = { host: hostId };
  if (type) {
    query.type = type;
  }

  return await Transaction.find(query)
    .sort('-createdAt')
    .populate('booking', 'startDate endDate listing')
    .populate('user', 'name');
};

// Currency conversion (simplified - in production use a real API)
export const convertCurrency = async (amount: number, from: string, to: string) => {
  // Simplified conversion rates (use real API like exchangerate-api.com in production)
  const rates: any = {
    GHS: 1,
    USD: 0.082,
    EUR: 0.076,
    GBP: 0.065,
    NGN: 67.5
  };

  if (!rates[from] || !rates[to]) {
    throw new Error('Unsupported currency');
  }

  const convertedAmount = (amount / rates[from]) * rates[to];
  return Math.round(convertedAmount * 100) / 100;
};
