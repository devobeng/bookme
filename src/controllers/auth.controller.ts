import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { user, token } = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.login(req.body.email, req.body.password);
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err: any) {
    return next(new AppError(err.message, 401));
  }
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const resetToken = await authService.forgotPassword(req.body.email);

  // Send it to user's email
  // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
  // For now, just return it in response for testing
  
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
    resetToken // TODO: Remove this in production and send email
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { user, token } = await authService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.passwordConfirm
  );

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const { user, token } = await authService.updatePassword(req.user.id, req.body.passwordCurrent, req.body.password);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

// Phone Verification
export const sendPhoneVerification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const result = await authService.sendPhoneVerification(req.user.id);

  res.status(200).json({
    status: 'success',
    message: result.message,
    otp: result.otp // TODO: Remove in production
  });
});

export const verifyPhone = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const result = await authService.verifyPhone(req.user.id, req.body.otp);

  res.status(200).json({
    status: 'success',
    message: result.message
  });
});

// Multi-Factor Authentication
export const enableMFA = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const result = await authService.enableMFA(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      secret: result.secret,
      qrCode: result.qrCode
    }
  });
});

export const verifyMFA = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const result = await authService.verifyMFA(req.user.id, req.body.token);

  res.status(200).json({
    status: 'success',
    message: result.message
  });
});

export const verifyMFALogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { user, token } = await authService.verifyMFALogin(req.body.userId, req.body.token);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

// Social Login
export const socialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { provider, profile } = req.body;
  const { user, token } = await authService.socialLogin(provider, profile);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});
