import mongoose, { Document, Schema } from 'mongoose';

export interface IVerification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'id' | 'phone' | 'email' | 'address' | 'payment';
  status: 'pending' | 'approved' | 'rejected';
  documentType?: 'passport' | 'drivers-license' | 'national-id';
  documentNumber?: string;
  documentImages?: string[];
  selfieImage?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  expiryDate?: Date;
  metadata?: any;
}

const verificationSchema = new mongoose.Schema<IVerification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['id', 'phone', 'email', 'address', 'payment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documentType: {
    type: String,
    enum: ['passport', 'drivers-license', 'national-id']
  },
  documentNumber: {
    type: String,
    select: false // Don't return by default for security
  },
  documentImages: [String],
  selfieImage: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  expiryDate: Date,
  metadata: Schema.Types.Mixed
});

verificationSchema.index({ user: 1, type: 1 });
verificationSchema.index({ status: 1 });

const Verification = mongoose.model<IVerification>('Verification', verificationSchema);

export default Verification;
