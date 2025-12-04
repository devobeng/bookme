import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  listing: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  host: mongoose.Types.ObjectId;
  ratings: {
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
  };
  overallRating: number;
  comment: string;
  hostReply?: {
    content: string;
    repliedAt: Date;
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>({
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Review must belong to a listing']
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Review must be associated with a booking']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a host']
  },
  ratings: {
    cleanliness: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    accuracy: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    checkIn: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    location: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Review must have a comment'],
    trim: true,
    minlength: [10, 'Review comment must be at least 10 characters'],
    maxlength: [1000, 'Review comment must not exceed 1000 characters']
  },
  hostReply: {
    content: {
      type: String,
      trim: true,
      maxlength: [500, 'Host reply must not exceed 500 characters']
    },
    repliedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: true
  },
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

// Calculate overall rating before saving
reviewSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    const { cleanliness, accuracy, checkIn, communication, location, value } = this.ratings;
    this.overallRating = Math.round(
      ((cleanliness + accuracy + checkIn + communication + location + value) / 6) * 10
    ) / 10;
  }
  next();
});

// Indexes
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
