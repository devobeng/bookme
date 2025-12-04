import { Request, Response, NextFunction } from 'express';
import * as safetyService from '../services/safety.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Submit ID verification
export const submitIdVerification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const verification = await safetyService.submitIdVerification(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'ID verification submitted for review',
    data: { verification }
  });
});

// Get user verifications
export const getMyVerifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const verifications = await safetyService.getUserVerifications(req.user.id);

  res.status(200).json({
    status: 'success',
    results: verifications.length,
    data: { verifications }
  });
});

// Get trust score
export const getTrustScore = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const score = await safetyService.calculateTrustScore(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { trustScore: score }
  });
});

// Create emergency contact
export const createEmergencyContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const contact = await safetyService.createEmergencyContact(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Emergency contact created. Support team has been notified.',
    data: { contact }
  });
});

// Admin: Get pending verifications
export const getPendingVerifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const verifications = await safetyService.getPendingVerifications();

  res.status(200).json({
    status: 'success',
    results: verifications.length,
    data: { verifications }
  });
});

// Admin: Review verification
export const reviewVerification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { decision, rejectionReason } = req.body;

  // @ts-ignore
  const verification = await safetyService.reviewVerification(
    req.params.id,
    req.user.id,
    decision,
    rejectionReason
  );

  res.status(200).json({
    status: 'success',
    data: { verification }
  });
});

// Admin: Get emergency contacts
export const getEmergencyContacts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const contacts = await safetyService.getEmergencyContacts(req.query.status as string);

  res.status(200).json({
    status: 'success',
    results: contacts.length,
    data: { contacts }
  });
});

// Admin: Assign emergency contact
export const assignEmergencyContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const contact = await safetyService.assignEmergencyContact(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { contact }
  });
});

// Admin: Resolve emergency contact
export const resolveEmergencyContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const contact = await safetyService.resolveEmergencyContact(req.params.id, req.body.resolution);

  res.status(200).json({
    status: 'success',
    message: 'Emergency contact resolved',
    data: { contact }
  });
});
