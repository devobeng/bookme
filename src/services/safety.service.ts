import Verification from '../models/Verification.js';
import User from '../models/User.js';
import EmergencyContact from '../models/EmergencyContact.js';

// Submit ID verification
export const submitIdVerification = async (
  userId: string,
  verificationData: {
    documentType: string;
    documentNumber: string;
    documentImages: string[];
    selfieImage: string;
    expiryDate?: Date;
  }
) => {
  // Check if verification already exists
  const existingVerification = await Verification.findOne({
    user: userId,
    type: 'id',
    status: { $in: ['pending', 'approved'] }
  });

  if (existingVerification) {
    if (existingVerification.status === 'approved') {
      throw new Error('ID already verified');
    }
    if (existingVerification.status === 'pending') {
      throw new Error('Verification already pending review');
    }
  }

  // Create new verification request
  const verification = await Verification.create({
    user: userId,
    type: 'id',
    ...verificationData,
    status: 'pending'
  });

  return verification;
};

// Get user verifications
export const getUserVerifications = async (userId: string) => {
  return await Verification.find({ user: userId })
    .select('-documentNumber') // Exclude sensitive data
    .sort('-submittedAt');
};

// Admin: Review verification
export const reviewVerification = async (
  verificationId: string,
  adminId: string,
  decision: 'approved' | 'rejected',
  rejectionReason?: string
) => {
  const verification = await Verification.findById(verificationId);

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.status !== 'pending') {
    throw new Error('Verification already reviewed');
  }

  verification.status = decision;
  verification.reviewedAt = new Date();
  verification.reviewedBy = adminId as any;
  
  if (decision === 'rejected' && rejectionReason) {
    verification.rejectionReason = rejectionReason;
  }

  await verification.save();

  // Update user verification status
  if (decision === 'approved' && verification.type === 'id') {
    await User.findByIdAndUpdate(verification.user, {
      isIdVerified: true
    });
  }

  return verification;
};

// Get pending verifications (admin)
export const getPendingVerifications = async () => {
  return await Verification.find({ status: 'pending' })
    .populate('user', 'name email')
    .sort('-submittedAt');
};

// Trust Score Calculation
export const calculateTrustScore = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) return 0;

  let score = 0;

  // Email verified: +20
  if (user.isEmailVerified) score += 20;

  // Phone verified: +15
  if (user.isPhoneVerified) score += 15;

  // ID verified: +30
  if (user.isIdVerified) score += 30;

  // Profile completeness: +15
  if (user.photo && user.bio) score += 15;

  // Reviews: +20 (if good ratings)
  // This would require querying reviews
  // For now, placeholder
  score += 10;

  return Math.min(score, 100); // Cap at 100
};

// Emergency Support
export const createEmergencyContact = async (
  userId: string,
  contactData: {
    type: string;
    description: string;
    location?: string;
    contactNumber?: string;
    bookingId?: string;
  }
) => {
  // Determine priority based on type
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  
  if (contactData.type === 'medical' || contactData.type === 'safety-concern') {
    priority = 'critical';
  } else if (contactData.type === 'property-damage') {
    priority = 'high';
  }

  const emergencyContact = await EmergencyContact.create({
    user: userId,
    booking: contactData.bookingId,
    type: contactData.type,
    description: contactData.description,
    location: contactData.location,
    contactNumber: contactData.contactNumber,
    priority,
    status: 'open'
  });

  // TODO: Send immediate notification to support team
  // TODO: If critical, trigger emergency response protocol

  return emergencyContact;
};

// Get emergency contacts (admin)
export const getEmergencyContacts = async (status?: string) => {
  const query: any = {};
  if (status) query.status = status;

  return await EmergencyContact.find(query)
    .populate('user', 'name email phoneNumber')
    .populate('booking', 'listing startDate endDate')
    .sort('-priority -createdAt');
};

// Assign emergency contact to support staff
export const assignEmergencyContact = async (
  contactId: string,
  supportStaffId: string
) => {
  return await EmergencyContact.findByIdAndUpdate(
    contactId,
    {
      assignedTo: supportStaffId,
      status: 'in-progress'
    },
    { new: true }
  );
};

// Resolve emergency contact
export const resolveEmergencyContact = async (
  contactId: string,
  resolution: string
) => {
  return await EmergencyContact.findByIdAndUpdate(
    contactId,
    {
      status: 'resolved',
      resolution,
      resolvedAt: new Date()
    },
    { new: true }
  );
};

// Secure Payment Validation
export const validatePaymentSecurity = async (
  userId: string,
  amount: number
) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Security checks
  const checks = {
    emailVerified: user.isEmailVerified,
    phoneVerified: user.isPhoneVerified,
    idVerified: user.isIdVerified,
    accountAge: (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24), // days
    suspiciousActivity: false // Placeholder for fraud detection
  };

  // High-value transaction checks
  if (amount > 5000) {
    if (!checks.idVerified) {
      throw new Error('ID verification required for high-value transactions');
    }
    if (checks.accountAge < 7) {
      throw new Error('Account must be at least 7 days old for high-value transactions');
    }
  }

  return {
    approved: true,
    checks
  };
};

export default {
  submitIdVerification,
  getUserVerifications,
  reviewVerification,
  getPendingVerifications,
  calculateTrustScore,
  createEmergencyContact,
  getEmergencyContacts,
  assignEmergencyContact,
  resolveEmergencyContact,
  validatePaymentSecurity
};
