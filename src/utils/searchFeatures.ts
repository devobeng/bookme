import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';

class SearchFeatures {
  query: any;
  queryString: any;

  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  // Location-based search
  searchByLocation() {
    if (this.queryString.location) {
      const locationRegex = new RegExp(this.queryString.location, 'i');
      this.query = this.query.find({
        $or: [
          { 'address.city': locationRegex },
          { 'address.state': locationRegex },
          { 'address.country': locationRegex },
          { 'location.address': locationRegex }
        ]
      });
    }
    return this;
  }

  // Map-based geospatial search
  searchNearby() {
    if (this.queryString.lat && this.queryString.lng && this.queryString.distance) {
      const lat = parseFloat(this.queryString.lat);
      const lng = parseFloat(this.queryString.lng);
      const distance = parseFloat(this.queryString.distance);

      this.query = this.query.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: distance * 1000 // Convert km to meters
          }
        }
      });
    }
    return this;
  }

  // Date-based availability filtering
  async filterByDates() {
    if (this.queryString.checkIn && this.queryString.checkOut) {
      const checkIn = new Date(this.queryString.checkIn);
      const checkOut = new Date(this.queryString.checkOut);

      // Get all listings
      const allListings = await this.query.clone();

      // Get bookings that overlap with requested dates
      const overlappingBookings = await Booking.find({
        $or: [
          {
            startDate: { $lte: checkOut },
            endDate: { $gte: checkIn }
          }
        ]
      }).select('listing');

      const bookedListingIds = overlappingBookings.map(b => b.listing.toString());

      // Filter out booked listings
      this.query = this.query.find({
        _id: { $nin: bookedListingIds }
      });
    }
    return this;
  }

  // Guest count filtering
  filterByGuests() {
    if (this.queryString.guests) {
      const guests = parseInt(this.queryString.guests);
      this.query = this.query.find({
        guestCapacity: { $gte: guests }
      });
    }
    return this;
  }

  // Price range filtering
  filterByPrice() {
    if (this.queryString.minPrice || this.queryString.maxPrice) {
      const priceFilter: any = {};
      if (this.queryString.minPrice) {
        priceFilter.$gte = parseFloat(this.queryString.minPrice);
      }
      if (this.queryString.maxPrice) {
        priceFilter.$lte = parseFloat(this.queryString.maxPrice);
      }
      this.query = this.query.find({ price: priceFilter });
    }
    return this;
  }

  // Property type filtering
  filterByPropertyType() {
    if (this.queryString.propertyType) {
      const types = Array.isArray(this.queryString.propertyType)
        ? this.queryString.propertyType
        : [this.queryString.propertyType];
      this.query = this.query.find({ propertyType: { $in: types } });
    }
    return this;
  }

  // Amenities filtering
  filterByAmenities() {
    if (this.queryString.amenities) {
      const amenities = Array.isArray(this.queryString.amenities)
        ? this.queryString.amenities
        : this.queryString.amenities.split(',');
      this.query = this.query.find({ amenities: { $all: amenities } });
    }
    return this;
  }

  // Booking type filtering
  filterByBookingType() {
    if (this.queryString.instantBooking === 'true') {
      this.query = this.query.find({ instantBooking: true });
    }
    return this;
  }

  // Accessibility features filtering
  filterByAccessibility() {
    if (this.queryString.accessibility) {
      const features = Array.isArray(this.queryString.accessibility)
        ? this.queryString.accessibility
        : this.queryString.accessibility.split(',');
      this.query = this.query.find({ accessibilityFeatures: { $all: features } });
    }
    return this;
  }

  // House rules filtering
  filterByHouseRules() {
    if (this.queryString.pets === 'true') {
      this.query = this.query.find({ 'houseRules.pets': true });
    }
    if (this.queryString.smoking === 'true') {
      this.query = this.query.find({ 'houseRules.smoking': true });
    }
    if (this.queryString.events === 'true') {
      this.query = this.query.find({ 'houseRules.events': true });
    }
    return this;
  }

  // Ratings filtering
  filterByRating() {
    if (this.queryString.minRating) {
      const minRating = parseFloat(this.queryString.minRating);
      this.query = this.query.find({ ratingsAverage: { $gte: minRating } });
    }
    return this;
  }

  // Category filtering
  filterByCategory() {
    if (this.queryString.category) {
      const categories = Array.isArray(this.queryString.category)
        ? this.queryString.category
        : [this.queryString.category];
      this.query = this.query.find({ category: { $in: categories } });
    }
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sortBy) {
      let sortBy = this.queryString.sortBy;

      // Handle special sort cases
      switch (sortBy) {
        case 'price-asc':
          sortBy = 'price';
          break;
        case 'price-desc':
          sortBy = '-price';
          break;
        case 'rating':
          sortBy = '-ratingsAverage';
          break;
        case 'top-rated':
          sortBy = '-ratingsAverage -ratingsQuantity';
          break;
        case 'distance':
          // Distance sorting is handled by $near in searchNearby
          break;
        default:
          sortBy = sortBy.split(',').join(' ');
      }

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // Field limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
}

export default SearchFeatures;
