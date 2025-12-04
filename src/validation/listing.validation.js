const { body } = require('express-validator');

exports.createListing = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('location').notEmpty().withMessage('Location is required')
];
