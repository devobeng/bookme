import { Request, Response, NextFunction } from 'express';
import * as listingService from '../services/listing.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const aliasTopListings = (req: Request, res: Response, next: NextFunction) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'title,price,ratingsAverage,summary,difficulty';
  next();
};

export const getAllListings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listings = await listingService.getAllListings(req.query);

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings
    }
  });
});

export const getListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listing = await listingService.getListing(req.params.id);

  if (!listing) {
    return next(new AppError('No listing found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      listing
    }
  });
});

export const createListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.body.host = req.user.id;
  const listing = await listingService.createListing(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      listing
    }
  });
});

export const updateListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listing = await listingService.updateListing(req.params.id, req.body);

  if (!listing) {
    return next(new AppError('No listing found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      listing
    }
  });
});

export const deleteListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listing = await listingService.deleteListing(req.params.id);

  if (!listing) {
    return next(new AppError('No listing found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Availability
export const checkAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;
  const result = await listingService.checkAvailability(
    req.params.id,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const updateAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listing = await listingService.updateAvailability(req.params.id, req.body.dates);

  res.status(200).json({
    status: 'success',
    data: {
      listing
    }
  });
});

// Similar Listings
export const getSimilarListings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const similarListings = await listingService.getSimilarListings(req.params.id, limit);

  res.status(200).json({
    status: 'success',
    results: similarListings.length,
    data: {
      listings: similarListings
    }
  });
});

// Comprehensive Search
export const searchListings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listings = await listingService.getAllListings(req.query);

  // Get total count for pagination metadata
  const totalCount = await listingService.getListingsCount(req.query);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  res.status(200).json({
    status: 'success',
    results: listings.length,
    totalResults: totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    data: {
      listings
    }
  });
});
