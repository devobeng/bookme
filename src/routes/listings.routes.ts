import express from 'express';
import * as listingController from '../controllers/listing.controller.js';
import * as geospatialController from '../controllers/geospatial.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { createListing } from '../validation/listing.validation.js';

const router = express.Router();

// GET /api/v1/listings/top-5-cheap
router.route('/top-5-cheap').get(listingController.aliasTopListings, listingController.getAllListings);

// GET /api/v1/listings/search (comprehensive search with all filters)
router.get('/search', listingController.searchListings);

// Map & Geospatial routes
router.get('/map/bounds', geospatialController.searchInBounds);
router.get('/map/markers', geospatialController.getMapMarkers);
router.get('/map/clusters', geospatialController.getClusteredMarkers);
router.get('/map/neighborhood', geospatialController.getNeighborhoodInfo);
router.post('/map/:listingId/landmarks', geospatialController.getDistancesToLandmarks);

// GET /api/v1/listings
router.get('/', listingController.getAllListings);

// GET /api/v1/listings/:id
router.get('/:id', listingController.getListing);

// GET /api/v1/listings/:id/similar
router.get('/:id/similar', listingController.getSimilarListings);

// GET /api/v1/listings/:id/availability
router.get('/:id/availability', listingController.checkAvailability);

// POST /api/v1/listings
router.post('/', authMiddleware.protect, createListing, validate, listingController.createListing);

// PATCH /api/v1/listings/:id
router.patch('/:id', authMiddleware.protect, listingController.updateListing);

// PATCH /api/v1/listings/:id/availability
router.patch('/:id/availability', authMiddleware.protect, listingController.updateAvailability);

// DELETE /api/v1/listings/:id
router.delete('/:id', authMiddleware.protect, listingController.deleteListing);

export default router;
