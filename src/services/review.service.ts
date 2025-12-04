import Review from '../models/Review.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';

// Create review
export const createReview = async (reviewData: any) => {
  // Check if booking exists and is completed
  const booking = await Booking.findById(reviewData.booking);
  
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== reviewData.user) {
    throw new Error('You can only review your own bookings');
  }

  if (booking.status !== 'completed') {
    throw new Error('You can only review completed bookings');
  }

  // Check if review already exists for this booking
  const existingReview = await Review.findOne({ booking: reviewData.booking });
  if (existingReview) {
    throw new Error('You have already reviewed this booking');
  }

  // Set host from booking
  reviewData.host = booking.host;
  reviewData.listing = booking.listing;

  // Create review
  const review = await Review.create(reviewData);

  // Update listing ratings
  await updateListingRatings(booking.listing.toString());

  return review;
};

// Get listing reviews
export const getListingReviews = async (listingId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ listing: listingId, isPublic: true })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('user', 'name photo');

  const totalReviews = await Review.countDocuments({ listing: listingId, isPublic: true });

  return {
    reviews,
    totalReviews,
    page,
    totalPages: Math.ceil(totalReviews / limit)
  };
};

// Get user's reviews
export const getUserReviews = async (userId: string) => {
  return await Review.find({ user: userId })
    .sort('-createdAt')
    .populate('listing', 'title images');
};

// Get host's reviews (reviews for their listings)
export const getHostReviews = async (hostId: string) => {
  return await Review.find({ host: hostId, isPublic: true })
    .sort('-createdAt')
    .populate('listing', 'title images')
    .populate('user', 'name photo');
};

// Host reply to review
export const replyToReview = async (reviewId: string, hostId: string, replyContent: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.host.toString() !== hostId) {
    throw new Error('You can only reply to reviews for your listings');
  }

  if (review.hostReply) {
    throw new Error('You have already replied to this review');
  }

  review.hostReply = {
    content: replyContent,
    repliedAt: new Date()
  };

  await review.save();

  return review;
};

// Update host reply
export const updateHostReply = async (reviewId: string, hostId: string, replyContent: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.host.toString() !== hostId) {
    throw new Error('Unauthorized');
  }

  if (!review.hostReply) {
    throw new Error('No reply exists to update');
  }

  review.hostReply.content = replyContent;
  await review.save();

  return review;
};

// Delete review (admin only or within 48 hours)
export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.user.toString() !== userId) {
    throw new Error('You can only delete your own reviews');
  }

  // Check if within 48 hours
  const hoursSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > 48) {
    throw new Error('Reviews can only be deleted within 48 hours of posting');
  }

  await review.deleteOne();

  // Update listing ratings
  await updateListingRatings(review.listing.toString());

  return review;
};

// Update listing ratings (called after review creation/deletion)
export const updateListingRatings = async (listingId: string) => {
  const reviews = await Review.find({ listing: listingId, isPublic: true });

  if (reviews.length === 0) {
    await Listing.findByIdAndUpdate(listingId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
  const avgRating = totalRating / reviews.length;

  await Listing.findByIdAndUpdate(listingId, {
    ratingsAverage: Math.round(avgRating * 10) / 10,
    ratingsQuantity: reviews.length
  });
};

// Get review statistics for a listing
export const getReviewStats = async (listingId: string) => {
  const reviews = await Review.find({ listing: listingId, isPublic: true });

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRatings: null
    };
  }

  const stats = {
    totalReviews: reviews.length,
    averageRatings: {
      overall: 0,
      cleanliness: 0,
      accuracy: 0,
      checkIn: 0,
      communication: 0,
      location: 0,
      value: 0
    }
  };

  reviews.forEach(review => {
    stats.averageRatings.overall += review.overallRating;
    stats.averageRatings.cleanliness += review.ratings.cleanliness;
    stats.averageRatings.accuracy += review.ratings.accuracy;
    stats.averageRatings.checkIn += review.ratings.checkIn;
    stats.averageRatings.communication += review.ratings.communication;
    stats.averageRatings.location += review.ratings.location;
    stats.averageRatings.value += review.ratings.value;
  });

  Object.keys(stats.averageRatings).forEach(key => {
    stats.averageRatings[key as keyof typeof stats.averageRatings] = 
      Math.round((stats.averageRatings[key as keyof typeof stats.averageRatings] / reviews.length) * 10) / 10;
  });

  return stats;
};
