import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  booking?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  host?: mongoose.Types.ObjectId;
  type: 'payment' | 'payout' | 'refund' | 'security-deposit' | 'security-deposit-refund';
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'mobile-money' | 'bank-transfer';
  paymentProvider: 'paystack';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paystackReference?: string;
  paystackAccessCode?: string;
  breakdown?: {
    subtotal: number;
    serviceFee: number;
    platformFee: number;
    securityDeposit?: number;
    total: number;
  };
  metadata?: any;
  failureReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['payment', 'payout', 'refund', 'security-deposit', 'security-deposit-refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'GHS',
    enum: ['GHS', 'USD', 'EUR', 'GBP', 'NGN']
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'mobile-money', 'bank-transfer'],
    required: true
  },
  paymentProvider: {
    type: String,
    enum: ['paystack'],
    default: 'paystack'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paystackReference: String,
  paystackAccessCode: String,
  breakdown: {
    subtotal: Number,
    serviceFee: Number,
    platformFee: Number,
    securityDeposit: Number,
    total: Number
  },
  metadata: Schema.Types.Mixed,
  failureReason: String,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ host: 1, type: 1 });
transactionSchema.index({ booking: 1 });
transactionSchema.index({ paystackReference: 1 });

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
