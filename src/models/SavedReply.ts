import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedReply extends Document {
  host: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category?: string;
  createdAt: Date;
}

const savedReplySchema = new mongoose.Schema<ISavedReply>({
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Saved reply must have a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Saved reply must have content'],
    trim: true
  },
  category: {
    type: String,
    enum: ['check-in', 'check-out', 'house-rules', 'directions', 'amenities', 'other'],
    default: 'other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
savedReplySchema.index({ host: 1 });

const SavedReply = mongoose.model<ISavedReply>('SavedReply', savedReplySchema);

export default SavedReply;
