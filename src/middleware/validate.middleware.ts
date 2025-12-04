import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export default (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err: any) => err.msg).join('. ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};
