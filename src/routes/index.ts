import express from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import listingsRoutes from './listings.routes.js';
import bookingsRoutes from './bookings.routes.js';
import paymentsRoutes from './payments.routes.js';
import reviewsRoutes from './reviews.routes.js';
import messagesRoutes from './messages.routes.js';
import hostRoutes from './host.routes.js';
import adminRoutes from './admin.routes.js';
import notificationsRoutes from './notifications.routes.js';
import safetyRoutes from './safety.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/listings', listingsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/messages', messagesRoutes);
router.use('/host', hostRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/safety', safetyRoutes);

export default router;
