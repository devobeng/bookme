import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// User Management
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await adminService.getAllUsers(req.query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await adminService.getUserById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const updateUserRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role);

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const suspendUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await adminService.suspendUser(req.params.id, req.body.reason);

  res.status(200).json({
    status: 'success',
    message: 'User suspended',
    data: { user }
  });
});

export const reactivateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await adminService.reactivateUser(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User reactivated',
    data: { user }
  });
});

// Host Verification
export const verifyHost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await adminService.verifyHost(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Host verified',
    data: { user }
  });
});

export const getPendingVerifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hosts = await adminService.getPendingHostVerifications();

  res.status(200).json({
    status: 'success',
    results: hosts.length,
    data: { hosts }
  });
});

// Listing Approvals
export const getPendingListings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listings = await adminService.getPendingListings();

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: { listings }
  });
});

export const approveListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listing = await adminService.approveListing(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Listing approved',
    data: { listing }
  });
});

export const rejectListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const listing = await adminService.rejectListing(req.params.id, req.body.reason);

  res.status(200).json({
    status: 'success',
    message: 'Listing rejected',
    data: { listing }
  });
});

// Reports & Disputes
export const getReports = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const reports = await adminService.getAllReports(req.query.status as string);

  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: { reports }
  });
});

export const assignReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const report = await adminService.assignReport(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});

export const resolveReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const report = await adminService.resolveReport(req.params.id, req.body.resolution);

  res.status(200).json({
    status: 'success',
    message: 'Report resolved',
    data: { report }
  });
});

// Financial Dashboard
export const getFinancialStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  const stats = await adminService.getFinancialStats(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// Analytics
export const getAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const analytics = await adminService.getPlatformAnalytics();

  res.status(200).json({
    status: 'success',
    data: analytics
  });
});

// Fraud Prevention
export const getFraudAlerts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const alerts = await adminService.getFraudAlerts();

  res.status(200).json({
    status: 'success',
    data: alerts
  });
});

// Manual Refund
export const processManualRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { bookingId, amount, reason } = req.body;

  // @ts-ignore
  const refund = await adminService.processManualRefund(bookingId, amount, reason, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Refund processed',
    data: { refund }
  });
});
