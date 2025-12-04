import Listing from '../models/Listing.js';

// Map-based search with bounding box
export const searchListingsInBounds = async (bounds: {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}) => {
  const { northEast, southWest } = bounds;

  // Create polygon for bounding box
  const listings = await Listing.find({
    'location.coordinates': {
      $geoWithin: {
        $box: [
          [southWest.lng, southWest.lat], // Bottom-left
          [northEast.lng, northEast.lat]  // Top-right
        ]
      }
    }
  }).select('title price location images ratingsAverage');

  return listings;
};

// Get listings with price markers for map display
export const getMapMarkers = async (bounds: {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}, filters?: any) => {
  const { northEast, southWest } = bounds;

  const query: any = {
    'location.coordinates': {
      $geoWithin: {
        $box: [
          [southWest.lng, southWest.lat],
          [northEast.lng, northEast.lat]
        ]
      }
    }
  };

  // Apply additional filters
  if (filters?.minPrice) {
    query.price = { ...query.price, $gte: filters.minPrice };
  }
  if (filters?.maxPrice) {
    query.price = { ...query.price, $lte: filters.maxPrice };
  }
  if (filters?.propertyType) {
    query.propertyType = filters.propertyType;
  }

  const listings = await Listing.find(query).select('_id title price location images');

  // Format for map markers
  return listings.map(listing => ({
    id: listing._id,
    title: listing.title,
    price: listing.price,
    coordinates: {
      lat: listing.location.coordinates[1],
      lng: listing.location.coordinates[0]
    },
    image: listing.images[0]
  }));
};

// Get neighborhood information
export const getNeighborhoodInfo = async (lat: number, lng: number, radius: number = 2) => {
  // Find listings in the area
  const nearbyListings = await Listing.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    }
  }).limit(50);

  if (nearbyListings.length === 0) {
    return {
      averagePrice: 0,
      totalListings: 0,
      averageRating: 0,
      propertyTypes: {}
    };
  }

  // Calculate statistics
  const totalPrice = nearbyListings.reduce((sum, l) => sum + l.price, 0);
  const totalRating = nearbyListings.reduce((sum, l) => sum + l.ratingsAverage, 0);

  // Count property types
  const propertyTypes: any = {};
  nearbyListings.forEach(listing => {
    propertyTypes[listing.propertyType] = (propertyTypes[listing.propertyType] || 0) + 1;
  });

  return {
    averagePrice: Math.round(totalPrice / nearbyListings.length),
    totalListings: nearbyListings.length,
    averageRating: Math.round((totalRating / nearbyListings.length) * 10) / 10,
    propertyTypes,
    radius
  };
};

// Calculate distance to landmarks
export const calculateDistanceToLandmarks = async (listingId: string, landmarks: Array<{
  name: string;
  lat: number;
  lng: number;
}>) => {
  const listing = await Listing.findById(listingId);
  
  if (!listing) {
    throw new Error('Listing not found');
  }

  const listingLat = listing.location.coordinates[1];
  const listingLng = listing.location.coordinates[0];

  // Calculate distances using Haversine formula
  const distances = landmarks.map(landmark => {
    const distance = calculateHaversineDistance(
      listingLat,
      listingLng,
      landmark.lat,
      landmark.lng
    );

    return {
      name: landmark.name,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      unit: 'km'
    };
  });

  return distances.sort((a, b) => a.distance - b.distance);
};

// Haversine formula for distance calculation
function calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get clustered markers for zoom levels
export const getClusteredMarkers = async (
  bounds: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  },
  zoom: number
) => {
  const { northEast, southWest } = bounds;

  const listings = await Listing.find({
    'location.coordinates': {
      $geoWithin: {
        $box: [
          [southWest.lng, southWest.lat],
          [northEast.lng, northEast.lat]
        ]
      }
    }
  }).select('_id price location');

  // For high zoom levels (>= 14), return individual markers
  if (zoom >= 14) {
    return listings.map(listing => ({
      type: 'individual',
      id: listing._id,
      price: listing.price,
      coordinates: {
        lat: listing.location.coordinates[1],
        lng: listing.location.coordinates[0]
      }
    }));
  }

  // For lower zoom levels, cluster nearby listings
  const gridSize = zoom >= 12 ? 0.01 : zoom >= 10 ? 0.05 : 0.1;
  const clusters: any = {};

  listings.forEach(listing => {
    const lat = listing.location.coordinates[1];
    const lng = listing.location.coordinates[0];
    
    // Round to grid
    const gridLat = Math.round(lat / gridSize) * gridSize;
    const gridLng = Math.round(lng / gridSize) * gridSize;
    const key = `${gridLat},${gridLng}`;

    if (!clusters[key]) {
      clusters[key] = {
        type: 'cluster',
        coordinates: { lat: gridLat, lng: gridLng },
        count: 0,
        averagePrice: 0,
        totalPrice: 0,
        listings: []
      };
    }

    clusters[key].count++;
    clusters[key].totalPrice += listing.price;
    clusters[key].listings.push(listing._id);
  });

  // Calculate average prices
  return Object.values(clusters).map((cluster: any) => ({
    type: cluster.type,
    coordinates: cluster.coordinates,
    count: cluster.count,
    averagePrice: Math.round(cluster.totalPrice / cluster.count),
    listings: cluster.listings
  }));
};

export default {
  searchListingsInBounds,
  getMapMarkers,
  getNeighborhoodInfo,
  calculateDistanceToLandmarks,
  getClusteredMarkers
};
