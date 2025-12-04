import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filterObj = (obj: any, ...allowedFields: string[]) => {
    const newObj: any = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

  const filteredBody = filterObj(req.body, 'name', 'email', 'bio', 'photo', 'phoneNumber', 'notificationSettings');

  // 3) Update user document
  // @ts-ignore
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

export const deleteMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
