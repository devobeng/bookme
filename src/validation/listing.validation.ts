import { body } from 'express-validator';

export const createListing = [
  body('title').notEmpty().withMessage('Title is required').isLength({ min: 10, max: 100 }),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('propertyType').notEmpty().withMessage('Property type is required'),
  body('guestCapacity').isInt({ min: 1 }).withMessage('Guest capacity must be at least 1'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a number'),
  body('beds').isInt({ min: 0 }).withMessage('Beds must be a number'),
  body('bathrooms').isNumeric().withMessage('Bathrooms must be a number'),
  body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

export const updateListing = [
  body('title').optional().isLength({ min: 10, max: 100 }),
  body('price').optional().isNumeric(),
  body('guestCapacity').optional().isInt({ min: 1 }),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('beds').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isNumeric()
];

