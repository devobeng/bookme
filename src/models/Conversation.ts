import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  booking?: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new mongoose.Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
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

// Index for efficient queries
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ booking: 1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;
