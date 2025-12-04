import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';
import { jwtSecret } from '../config/env.js';

const signToken = (id: string) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '90d'
  });
};

export const register = async (userData: Partial<IUser>) => {
  const newUser = await User.create(userData);
  const token = signToken(newUser._id.toString());
  return { user: newUser, token };
};

export const login = async (email?: string, password?: string) => {
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new Error('Incorrect email or password');
  }

  const token = signToken(user._id.toString());
  return { user, token };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('There is no user with email address.');
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

export const resetPassword = async (token: string, password: string, passwordConfirm: string) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Token is invalid or has expired');
  }

  user.password = password;
  // user.passwordConfirm = passwordConfirm; // Assuming validation handles this or we add it to schema
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const jwtToken = signToken(user._id.toString());
  return { user, token: jwtToken };
};

export const updatePassword = async (userId: string, passwordCurrent: string, passwordNew: string) => {
  const user = await User.findById(userId).select('+password');

  if (!user || !(await user.correctPassword(passwordCurrent, user.password))) {
    throw new Error('Your current password is wrong');
  }

  user.password = passwordNew;
  await user.save();

  const token = signToken(user._id.toString());
  return { user, token };
};

import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Phone Verification
export const sendPhoneVerification = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const otp = user.createPhoneVerificationToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send OTP via SMS service (Twilio, etc.)
  // For now, return OTP for testing
  return { otp, message: 'OTP sent to phone' };
};

export const verifyPhone = async (userId: string, otp: string) => {
  const hashedOTP = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  const user = await User.findOne({
    _id: userId,
    phoneVerificationToken: hashedOTP,
    phoneVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('OTP is invalid or has expired');
  }

  user.isPhoneVerified = true;
  user.phoneVerificationToken = undefined;
  user.phoneVerificationExpires = undefined;
  await user.save();

  return { message: 'Phone verified successfully' };
};

// Multi-Factor Authentication
export const enableMFA = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const secret = speakeasy.generateSecret({
    name: `BookMe (${user.email})`
  });

  user.mfaSecret = secret.base32;
  user.isMFAEnabled = false; // Will be enabled after verification
  await user.save();

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl
  };
};

export const verifyMFA = async (userId: string, token: string) => {
  const user = await User.findById(userId);
  if (!user || !user.mfaSecret) {
    throw new Error('MFA not set up for this user');
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    throw new Error('Invalid MFA token');
  }

  user.isMFAEnabled = true;
  await user.save();

  return { message: 'MFA enabled successfully' };
};

export const verifyMFALogin = async (userId: string, token: string) => {
  const user = await User.findById(userId);
  if (!user || !user.mfaSecret || !user.isMFAEnabled) {
    throw new Error('MFA not enabled for this user');
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });

  if (!verified) {
    throw new Error('Invalid MFA token');
  }

  const jwtToken = signToken(user._id.toString());
  return { user, token: jwtToken };
};

// Social Login
export const socialLogin = async (provider: string, profile: any) => {
  let user;
  const providerField = `socialAccounts.${provider}Id`;

  // Check if user exists with this social account
  user = await User.findOne({ [providerField]: profile.id });

  if (!user) {
    // Check if user exists with this email
    user = await User.findOne({ email: profile.email });

    if (user) {
      // Link social account to existing user
      user.socialAccounts = user.socialAccounts || {};
      (user.socialAccounts as any)[`${provider}Id`] = profile.id;
      await user.save();
    } else {
      // Create new user
      const newUserData: any = {
        name: profile.name || profile.displayName,
        email: profile.email,
        socialAccounts: {
          [`${provider}Id`]: profile.id
        }
      };

      user = await User.create(newUserData);
    }
  }

  const token = signToken(user._id.toString());
  return { user, token };
};

