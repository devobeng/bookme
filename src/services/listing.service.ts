import Listing, { IListing } from '../models/Listing.js';

import SearchFeatures from '../utils/searchFeatures.js';

export const createListing = async (listingData: Partial<IListing>) => {
  return await Listing.create(listingData);
};

export const getAllListings = async (queryString: any) => {
  const searchFeatures = new SearchFeatures(Listing.find(), queryString);

  // Apply all filters
  await searchFeatures
    .searchByLocation()
    .searchNearby()
    .filterByDates();

  searchFeatures
    .filterByGuests()
    .filterByPrice()
    .filterByPropertyType()
    .filterByAmenities()
    .filterByBookingType()
    .filterByAccessibility()
    .filterByHouseRules()
    .filterByRating()
    .filterByCategory()
    .sort()
    .limitFields()
    .paginate();

  return await searchFeatures.query;
};

export const getListing = async (id: string) => {
  return await Listing.findById(id)
    .populate('host', 'name photo bio')
    .populate({
      path: 'reviews',
      options: { limit: 10, sort: { createdAt: -1 } }
    });
};

export const updateListing = async (id: string, updateData: Partial<IListing>) => {
  return await Listing.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};

export const deleteListing = async (id: string) => {
  return await Listing.findByIdAndDelete(id);
};

// Availability Management
export const checkAvailability = async (listingId: string, startDate: Date, endDate: Date) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }

  const unavailableDates = listing.availabilityCalendar.filter(
    (cal) => !cal.available && cal.date >= startDate && cal.date <= endDate
  );

  return {
    available: unavailableDates.length === 0,
    unavailableDates
  };
};

export const updateAvailability = async (
  listingId: string,
  dates: Array<{ date: Date; available: boolean; price?: number }>
) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }

  // Update or add availability entries
  dates.forEach((newEntry) => {
    const existingIndex = listing.availabilityCalendar.findIndex(
      (cal) => cal.date.toDateString() === new Date(newEntry.date).toDateString()
    );

    if (existingIndex > -1) {
      listing.availabilityCalendar[existingIndex] = newEntry;
    } else {
      listing.availabilityCalendar.push(newEntry);
    }
  });

  await listing.save();
  return listing;
};

// Similar Listings
export const getSimilarListings = async (listingId: string, limit: number = 5) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }

  // Find similar listings based on category, price range, and location
  const priceRange = listing.price * 0.3; // 30% price variance

  const similarListings = await Listing.find({
    _id: { $ne: listingId },
    category: listing.category,
    price: {
      $gte: listing.price - priceRange,
      $lte: listing.price + priceRange
    },
    'address.city': listing.address.city
  })
    .limit(limit)
    .select('title price images ratingsAverage location');

  return similarListings;
};

// Booking Insights
export const updateBookingInsights = async (listingId: string, bookingLength: number) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }

  const currentTotal = listing.bookingInsights.totalBookings;
  const currentAverage = listing.bookingInsights.averageBookingLength;

  listing.bookingInsights.totalBookings += 1;
  listing.bookingInsights.lastBookedDate = new Date();
  listing.bookingInsights.averageBookingLength =
    (currentAverage * currentTotal + bookingLength) / (currentTotal + 1);

  await listing.save();
  return listing;
};

// Count documents for pagination
export const getListingsCount = async (query: any) => {
  const searchFeatures = new SearchFeatures(Listing.find(), query);
  
  // Apply filters (without pagination)
  await searchFeatures
    .searchByLocation()
    .searchNearby()
    .filterByDates();

  searchFeatures
    .filterByGuests()
    .filterByPrice()
    .filterByPropertyType()
    .filterByAmenities()
    .filterByBookingType()
    .filterByAccessibility()
    .filterByHouseRules()
    .filterByRating()
    .filterByCategory();

  return await searchFeatures.query.countDocuments();
};
