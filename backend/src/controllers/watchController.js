const asyncHandler = require('express-async-handler');
const Watch = require('../models/watchModel');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require('../utils/errors');

// Function to convert string to title case
const titleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Valid condition options
const validConditions = ['New', 'Excellent', 'Good', 'Fair', 'Poor'];

// @desc    Create a new watch (Admin only)
// @route   POST /api/watches
// @access  Private (Admin)
const createWatch = asyncHandler(async (req, res, next) => {
  try {
    const {
      model, year, rental_day_price, condition, quantity, brand_id,
    } = req.body;

    // Identify missing fields
    const missingFields = [];
    if (!model) missingFields.push('model');
    if (!year) missingFields.push('year');
    if (!rental_day_price) missingFields.push('rental_day_price');
    if (!condition) missingFields.push('condition');
    if (!quantity) missingFields.push('quantity');
    if (!brand_id) missingFields.push('brand_id');

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Convert condition to title case
    const formattedCondition = titleCase(condition);

    // Validate condition
    if (!validConditions.includes(formattedCondition)) {
      throw new ValidationError(
        `Invalid condition: '${condition}'. Valid options are: ${validConditions.join(', ')}`,
      );
    }

    const watch = await Watch.create({
      model,
      year,
      rental_day_price,
      condition: formattedCondition,
      quantity,
      brand: brand_id,
    });

    if (watch) {
      res.status(201).json(watch);
    } else {
      throw new ValidationError('Invalid watch data');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get all watches
// @route   GET /api/watches
// @access  Public
const getWatches = asyncHandler(async (req, res, next) => {
  try {
    const watches = await Watch.find().populate('brand', 'brand_name');
    res.json(watches);
  } catch (error) {
    next(error);
  }
});

// @desc    Get a single watch by ID
// @route   GET /api/watches/:id
// @access  Public
const getWatchById = asyncHandler(async (req, res, next) => {
  try {
    const watch = await Watch.findById(req.params.id).populate('brand', 'brand_name');

    if (!watch) {
      throw new NotFoundError('Watch not found');
    }

    res.json(watch);
  } catch (error) {
    next(error);
  }
});

// @desc    Update a watch (Admin only)
// @route   PUT /api/watches/:id
// @access  Private (Admin)
const updateWatch = asyncHandler(async (req, res, next) => {
  try {
    const watch = await Watch.findById(req.params.id);

    if (!watch) {
      throw new NotFoundError('Watch not found');
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    watch.model = req.body.model || watch.model;
    watch.year = req.body.year || watch.year;
    watch.rental_day_price = req.body.rental_day_price || watch.rental_day_price;

    if (req.body.condition) {
      const formattedCondition = titleCase(req.body.condition);

      if (!validConditions.includes(formattedCondition)) {
        throw new ValidationError(
          `Invalid condition: '${req.body.condition}'. Valid options are: ${validConditions.join(', ')}`,
        );
      }

      watch.condition = formattedCondition;
    }

    watch.quantity = req.body.quantity !== undefined ? req.body.quantity : watch.quantity;

    if (req.body.brand_id) {
      watch.brand = req.body.brand_id;
    }

    const updatedWatch = await watch.save();
    res.json(updatedWatch);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a watch (Admin only)
// @route   DELETE /api/watches/:id
// @access  Private (Admin)
const deleteWatch = asyncHandler(async (req, res, next) => {
  try {
    const watch = await Watch.findById(req.params.id);

    if (!watch) {
      throw new NotFoundError('Watch not found');
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    await watch.deleteOne();
    res.json({ message: 'Watch removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createWatch,
  getWatches,
  getWatchById,
  updateWatch,
  deleteWatch,
};
