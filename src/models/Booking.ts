import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  listing: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  host: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  numberOfNights: number;
  priceBreakdown: {
    basePrice: number;
    cleaningFee: number;
    serviceFee: number;
    taxAmount: number;
    totalPrice: number;
  };
  paymentMethod: 'card' | 'paypal' | 'apple-pay';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  bookingType: 'instant' | 'request';
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  cancellationDetails?: {
    cancelledAt: Date;
    cancelledBy: 'guest' | 'host';
    reason?: string;
    refundAmount: number;
    refundPercentage: number;
  };
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
  calculateRefund(): { refundAmount: number; refundPercentage: number };
}

const bookingSchema = new mongoose.Schema<IBooking>({
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Booking must belong to a listing']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a host']
  },
  startDate: {
    type: Date,
    required: [true, 'Booking must have a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Booking must have an end date']
  },
  guests: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    },
    infants: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  numberOfNights: {
    type: Number,
    required: true
  },
  priceBreakdown: {
    basePrice: {
      type: Number,
      required: true
    },
    cleaningFee: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      required: true
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'apple-pay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: String,
  bookingType: {
    type: String,
    enum: ['instant', 'request'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: function() {
      return this.bookingType === 'instant' ? 'confirmed' : 'pending';
    }
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    required: true
  },
  cancellationDetails: {
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['guest', 'host']
    },
    reason: String,
    refundAmount: Number,
    refundPercentage: Number
  },
  specialRequests: String,
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

// Calculate refund based on cancellation policy and time until check-in
bookingSchema.methods.calculateRefund = function(): { refundAmount: number; refundPercentage: number } {
  const now = new Date();
  const checkIn = new Date(this.startDate);
  const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let refundPercentage = 0;

  switch (this.cancellationPolicy) {
    case 'flexible':
      // Full refund if cancelled 24 hours before check-in
      if (daysUntilCheckIn >= 1) {
        refundPercentage = 100;
      } else {
        refundPercentage = 0;
      }
      break;

    case 'moderate':
      // Full refund if cancelled 5 days before check-in
      // 50% refund if cancelled 5-1 days before
      if (daysUntilCheckIn >= 5) {
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 1) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }
      break;

    case 'strict':
      // Full refund if cancelled 14 days before check-in
      // 50% refund if cancelled 14-7 days before
      // No refund if less than 7 days
      if (daysUntilCheckIn >= 14) {
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 7) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }
      break;
  }

  const refundAmount = (this.priceBreakdown.totalPrice * refundPercentage) / 100;

  return { refundAmount, refundPercentage };
};

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ host: 1, status: 1 });
bookingSchema.index({ listing: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
