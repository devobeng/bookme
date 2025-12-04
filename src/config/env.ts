import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT || 5000;
export const mongoUri = process.env.MONGO_URI || '';
export const jwtSecret = process.env.JWT_SECRET || 'secret';
export const nodeEnv = process.env.NODE_ENV || 'development';
export const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
export const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
export const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

