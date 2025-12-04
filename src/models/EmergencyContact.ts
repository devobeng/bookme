import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact extends Document {
  user: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  type: 'safety-concern' | 'medical' | 'property-damage' | 'dispute' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  contactNumber?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const emergencyContactSchema = new mongoose.Schema<IEmergencyContact>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  type: {
    type: String,
    enum: ['safety-concern', 'medical', 'property-damage', 'dispute', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  location: String,
  contactNumber: String,
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

emergencyContactSchema.index({ status: 1, priority: -1 });
emergencyContactSchema.index({ user: 1 });

const EmergencyContact = mongoose.model<IEmergencyContact>('EmergencyContact', emergencyContactSchema);

export default EmergencyContact;
