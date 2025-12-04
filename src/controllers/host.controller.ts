import { Request, Response, NextFunction } from 'express';
import * as hostService from '../services/host.service.js';
import * as listingService from '../services/listing.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get host dashboard overview
export const getDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const dashboard = await hostService.getHostDashboard(req.user.id);

  res.status(200).json({
    status: 'success',
    data: dashboard
  });
});

// Get earnings report
export const getEarnings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;
  
  // @ts-ignore
  const report = await hostService.getEarningsReport(
    req.user.id,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.status(200).json({
    status: 'success',
    data: report
  });
});

// Get performance insights
export const getInsights = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const insights = await hostService.getPerformanceInsights(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      insights
    }
  });
});

// Add payout method
export const addPayoutMethod = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const result = await hostService.addPayoutMethod(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: result
  });
});

// Get reservations
export const getReservations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const reservations = await hostService.getReservations(req.user.id, req.query.status as string);

  res.status(200).json({
    status: 'success',
    results: reservations.length,
    data: {
      reservations
    }
  });
});

// Update listing pricing
export const updatePricing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const listing = await hostService.updateListingPricing(
    req.params.listingId,
    req.user.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      listing
    }
  });
});

// Get host's listings
export const getMyListings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const listings = await listingService.getAllListings({ host: req.user.id });

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings
    }
  });
});

// Update availability calendar
export const updateCalendar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listing = await listingService.updateAvailability(req.params.listingId, req.body.dates);

  res.status(200).json({
    status: 'success',
    data: {
      listing
    }
  });
});
