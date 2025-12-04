import { Request, Response, NextFunction } from 'express';
import * as geospatialService from '../services/geospatial.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Search listings in map bounds
export const searchInBounds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { neLat, neLng, swLat, swLng } = req.query;

  if (!neLat || !neLng || !swLat || !swLng) {
    return next(new AppError('Bounding box coordinates are required', 400));
  }

  const bounds = {
    northEast: { lat: parseFloat(neLat as string), lng: parseFloat(neLng as string) },
    southWest: { lat: parseFloat(swLat as string), lng: parseFloat(swLng as string) }
  };

  const listings = await geospatialService.searchListingsInBounds(bounds);

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings
    }
  });
});

// Get map markers with prices
export const getMapMarkers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { neLat, neLng, swLat, swLng, minPrice, maxPrice, propertyType } = req.query;

  if (!neLat || !neLng || !swLat || !swLng) {
    return next(new AppError('Bounding box coordinates are required', 400));
  }

  const bounds = {
    northEast: { lat: parseFloat(neLat as string), lng: parseFloat(neLng as string) },
    southWest: { lat: parseFloat(swLat as string), lng: parseFloat(swLng as string) }
  };

  const filters: any = {};
  if (minPrice) filters.minPrice = parseFloat(minPrice as string);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
  if (propertyType) filters.propertyType = propertyType;

  const markers = await geospatialService.getMapMarkers(bounds, filters);

  res.status(200).json({
    status: 'success',
    results: markers.length,
    data: {
      markers
    }
  });
});

// Get clustered markers based on zoom
export const getClusteredMarkers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { neLat, neLng, swLat, swLng, zoom } = req.query;

  if (!neLat || !neLng || !swLat || !swLng || !zoom) {
    return next(new AppError('Bounding box coordinates and zoom level are required', 400));
  }

  const bounds = {
    northEast: { lat: parseFloat(neLat as string), lng: parseFloat(neLng as string) },
    southWest: { lat: parseFloat(swLat as string), lng: parseFloat(swLng as string) }
  };

  const markers = await geospatialService.getClusteredMarkers(bounds, parseInt(zoom as string));

  res.status(200).json({
    status: 'success',
    results: markers.length,
    data: {
      markers
    }
  });
});

// Get neighborhood information
export const getNeighborhoodInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const info = await geospatialService.getNeighborhoodInfo(
    parseFloat(lat as string),
    parseFloat(lng as string),
    radius ? parseFloat(radius as string) : 2
  );

  res.status(200).json({
    status: 'success',
    data: info
  });
});

// Get distances to landmarks
export const getDistancesToLandmarks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { listingId } = req.params;
  const { landmarks } = req.body;

  if (!landmarks || !Array.isArray(landmarks)) {
    return next(new AppError('Landmarks array is required', 400));
  }

  const distances = await geospatialService.calculateDistanceToLandmarks(listingId, landmarks);

  res.status(200).json({
    status: 'success',
    data: {
      distances
    }
  });
});
