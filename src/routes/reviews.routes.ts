import express from 'express';
import * as reviewController from '../controllers/review.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/listings/:listingId', reviewController.getListingReviews);
router.get('/listings/:listingId/stats', reviewController.getReviewStats);

// Protected routes
router.use(authMiddleware.protect);

// Guest reviews
router.post('/', reviewController.createReview);
router.get('/my-reviews', reviewController.getMyReviews);
router.delete('/:id', reviewController.deleteReview);

// Host reviews and replies
router.get('/host-reviews', reviewController.getHostReviews);
router.post('/:id/reply', reviewController.replyToReview);
router.patch('/:id/reply', reviewController.updateReply);

export default router;
