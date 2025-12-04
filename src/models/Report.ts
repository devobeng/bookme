import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  reportedUser?: mongoose.Types.ObjectId;
  reportedListing?: mongoose.Types.ObjectId;
  reportedReview?: mongoose.Types.ObjectId;
  type: 'user' | 'listing' | 'review' | 'booking' | 'other';
  category: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const reportSchema = new mongoose.Schema<IReport>({
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedListing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  },
  reportedReview: {
    type: Schema.Types.ObjectId,
    ref: 'Review'
  },
  type: {
    type: String,
    enum: ['user', 'listing', 'review', 'booking', 'other'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['fraud', 'inappropriate-content', 'safety-concern', 'scam', 'harassment', 'other']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: String,
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.index({ status: 1, priority: -1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedListing: 1 });

const Report = mongoose.model<IReport>('Report', reportSchema);

export default Report;
