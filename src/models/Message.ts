import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'automated' | 'system';
  isRead: boolean;
  readAt?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message must have content'],
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'automated', 'system'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  attachments: [String],
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
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
