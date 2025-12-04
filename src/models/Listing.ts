import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  category: string;
  propertyType: string;
  guestCapacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  houseRules: {
    pets: boolean;
    smoking: boolean;
    events: boolean;
  };
  price: number;
  priceBreakdown: {
    cleaningFee: number;
    serviceFee: number;
    extraGuestFee: number;
  };
  host: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: number[];
    address: string;
    description: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  images: string[];
  cancellationPolicy: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  availabilityCalendar: Array<{
    date: Date;
    available: boolean;
    price?: number;
  }>;
  bookingInsights: {
    totalBookings: number;
    lastBookedDate?: Date;
    averageBookingLength: number;
  };
  instantBooking: boolean;
  accessibilityFeatures: string[];
  createdAt: Date;
}

const listingSchema = new mongoose.Schema<IListing>({
  title: {
    type: String,
    required: [true, 'A listing must have a title'],
    trim: true,
    maxlength: [100, 'A listing title must have less or equal then 100 characters'],
    minlength: [10, 'A listing title must have more or equal then 10 characters']
  },
  description: {
    type: String,
    required: [true, 'A listing must have a description']
  },
  category: {
    type: String,
    required: [true, 'A listing must have a category'],
    enum: ['beach', 'rooms', 'unique', 'camping', 'design', 'arctic', 'tropical', 'caves', 'national-parks']
  },
  propertyType: {
    type: String,
    required: [true, 'A listing must have a property type'],
    enum: ['entire-home', 'private-room', 'hotel', 'shared-room']
  },
  guestCapacity: {
    type: Number,
    required: [true, 'A listing must have a guest capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  bedrooms: {
    type: Number,
    required: [true, 'A listing must have a number of bedrooms']
  },
  beds: {
    type: Number,
    required: [true, 'A listing must have a number of beds']
  },
  bathrooms: {
    type: Number,
    required: [true, 'A listing must have a number of bathrooms']
  },
  amenities: [String],
  houseRules: {
    pets: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false },
    events: { type: Boolean, default: false }
  },
  price: {
    type: Number,
    required: [true, 'A listing must have a price']
  },
  priceBreakdown: {
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    extraGuestFee: { type: Number, default: 0 }
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A listing must belong to a host']
  },
  location: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  images: [String],
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: (val: number) => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  availabilityCalendar: [{
    date: {
      type: Date,
      required: true
    },
    available: {
      type: Boolean,
      default: true
    },
    price: Number
  }],
  bookingInsights: {
    totalBookings: {
      type: Number,
      default: 0
    },
    lastBookedDate: Date,
    averageBookingLength: {
      type: Number,
      default: 0
    }
  },
  instantBooking: {
    type: Boolean,
    default: false
  },
  accessibilityFeatures: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ price: 1, ratingsAverage: -1 });

const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing;
