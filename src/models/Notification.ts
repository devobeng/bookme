import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'booking' | 'payment' | 'review' | 'message' | 'listing' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  channels: Array<'email' | 'push' | 'in-app'>;
  emailSent: boolean;
  pushSent: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'review', 'message', 'listing', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: Schema.Types.Mixed,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  channels: [{
    type: String,
    enum: ['email', 'push', 'in-app']
  }],
  emailSent: {
    type: Boolean,
    default: false
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
