import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'host' | 'admin';
  createdAt: Date;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  photo?: string;
  bio?: string;
  isIdVerified: boolean;
  active: boolean;
  deviceToken?: string;
  suspensionReason?: string;
  suspendedAt?: Date;
  socialAccounts?: {
    googleId?: string;
    facebookId?: string;
    appleId?: string;
  };
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  phoneVerificationToken?: string;
  phoneVerificationExpires?: Date;
  isMFAEnabled: boolean;
  mfaSecret?: string;
  correctPassword(candidatePassword: string, userPassword?: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createPhoneVerificationToken(): string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'host', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  photo: String,
  bio: String,
  isIdVerified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  deviceToken: String,
  suspensionReason: String,
  suspendedAt: Date,
  socialAccounts: {
    googleId: String,
    facebookId: String,
    appleId: String
  },
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: true }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  phoneVerificationToken: String,
  phoneVerificationExpires: Date,
  isMFAEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: String
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword?: string
) {
  const pass = userPassword || this.password;
  if (!pass) return false;
  return await bcrypt.compare(candidatePassword, pass);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

import crypto from 'crypto';

userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

userSchema.methods.createPhoneVerificationToken = function(): string {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.phoneVerificationToken = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  this.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return otp;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
