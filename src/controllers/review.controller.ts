import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Create review
export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.body.user = req.user.id;

  const review = await reviewService.createReview(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Get listing reviews
export const getListingReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await reviewService.getListingReviews(req.params.listingId, page, limit);

  res.status(200).json({
    status: 'success',
    ...result
  });
});

// Get user's reviews
export const getMyReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const reviews = await reviewService.getUserReviews(req.user.id);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Get host's reviews
export const getHostReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const reviews = await reviewService.getHostReviews(req.user.id);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Host reply to review
export const replyToReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const review = await reviewService.replyToReview(
    req.params.id,
    req.user.id,
    req.body.reply
  );

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Update host reply
export const updateReply = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const review = await reviewService.updateHostReply(
    req.params.id,
    req.user.id,
    req.body.reply
  );

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Delete review
export const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  await reviewService.deleteReview(req.params.id, req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get review statistics
export const getReviewStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await reviewService.getReviewStats(req.params.listingId);

  res.status(200).json({
    status: 'success',
    data: stats
  });
});
