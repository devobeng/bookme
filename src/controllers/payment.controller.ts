import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Initialize payment
export const initializePayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { bookingId, amount, currency, paymentMethod } = req.body;

  // @ts-ignore
  const paymentData = await paymentService.initializePayment(
    req.user.id,
    bookingId,
    amount,
    currency,
    paymentMethod
  );

  res.status(200).json({
    status: 'success',
    data: paymentData
  });
});

// Verify payment (webhook or callback)
export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { reference } = req.query;

  if (!reference) {
    return next(new AppError('Payment reference is required', 400));
  }

  const transaction = await paymentService.verifyPayment(reference as string);

  res.status(200).json({
    status: 'success',
    data: {
      transaction
    }
  });
});

// Paystack webhook
export const paystackWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const event = req.body;

  // Verify webhook signature (important for security)
  // const hash = crypto.createHmac('sha512', paystackSecretKey).update(JSON.stringify(req.body)).digest('hex');
  // if (hash !== req.headers['x-paystack-signature']) {
  //   return res.status(400).send('Invalid signature');
  // }

  if (event.event === 'charge.success') {
    await paymentService.verifyPayment(event.data.reference);
  }

  res.status(200).send('Webhook received');
});

// Process refund
export const processRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { bookingId, amount, reason } = req.body;

  const refund = await paymentService.processRefund(bookingId, amount, reason);

  res.status(200).json({
    status: 'success',
    data: {
      refund
    }
  });
});

// Process host payout
export const processHostPayout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { amount, currency, recipientCode } = req.body;

  // @ts-ignore
  const payout = await paymentService.processHostPayout(
    req.user.id,
    amount,
    currency,
    recipientCode
  );

  res.status(200).json({
    status: 'success',
    data: {
      payout
    }
  });
});

// Get user transactions
export const getMyTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const transactions = await paymentService.getUserTransactions(req.user.id, req.query.type as string);

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: {
      transactions
    }
  });
});

// Get host transactions
export const getHostTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const transactions = await paymentService.getHostTransactions(req.user.id, req.query.type as string);

  res.status(200).json({
    status: 'success',
    results: transactions.length,
    data: {
      transactions
    }
  });
});

// Convert currency
export const convertCurrency = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { amount, from, to } = req.query;

  if (!amount || !from || !to) {
    return next(new AppError('Amount, from, and to currencies are required', 400));
  }

  const convertedAmount = await paymentService.convertCurrency(
    parseFloat(amount as string),
    from as string,
    to as string
  );

  res.status(200).json({
    status: 'success',
    data: {
      originalAmount: parseFloat(amount as string),
      originalCurrency: from,
      convertedAmount,
      targetCurrency: to
    }
  });
});
