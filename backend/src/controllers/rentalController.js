const asyncHandler = require('express-async-handler');
const Rental = require('../models/rentalModel');
const Watch = require('../models/watchModel');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');

// @desc    Create a new rental
// @route   POST /api/rentals
// @access  Private (User)
const createRental = asyncHandler(async (req, res, next) => {
  try {
    const { watch_id } = req.body;
    let { rental_days } = req.body;

    // Identify missing fields dynamically
    const missingFields = [];
    if (watch_id === undefined) missingFields.push('watch_id');
    if (rental_days === undefined) missingFields.push('rental_days');

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    rental_days = Number(rental_days); // Ensure it's a number

    // Validate rental duration
    if (rental_days <= 0) {
      throw new ValidationError('Rental duration must be at least 1 day.');
    }

    // Check if watch exists
    const watch = await Watch.findById(watch_id);
    if (!watch) {
      throw new NotFoundError('Watch not found');
    }

    // Check watch availability
    if (watch.quantity < 1) {
      throw new ValidationError('Watch is out of stock');
    }

    // Calculate rental dates and total price
    const total_rental_price = watch.rental_day_price * rental_days;
    const rental_start_date = new Date();
    const rental_end_date = new Date();
    rental_end_date.setDate(rental_start_date.getDate() + rental_days);

    // Create rental
    const rental = await Rental.create({
      user: req.user._id,
      watch: watch_id,
      rental_days,
      total_rental_price,
      rental_start_date,
      rental_end_date,
      rental_status: 'Pending',
    });

    // Reduce watch quantity
    watch.quantity -= 1;
    await watch.save();

    res.status(201).json(rental);
  } catch (error) {
    next(error);
  }
});

// @desc    Get all rentals (Admin only)
// @route   GET /api/rentals
// @access  Private (Admin)
const getRentals = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const rentals = await Rental.find()
      .populate('user', 'first_name last_name email')
      .populate('watch', 'model year brand');

    res.json(rentals);
  } catch (error) {
    next(error);
  }
});

// @desc    Get rental by ID
// @route   GET /api/rentals/:id
// @access  Private (User/Admin)
const getRentalById = asyncHandler(async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('user', 'first_name last_name email')
      .populate('watch', 'model year brand');

    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    // Ensure user owns the rental or is an admin
    if (rental.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view this rental');
    }

    res.json(rental);
  } catch (error) {
    next(error);
  }
});

// @desc    Update rental status
// @route   PATCH /api/rentals/:id
// @access  Private (Admin)
const updateRentalStatus = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    rental.rental_status = req.body.rental_status || rental.rental_status;
    const updatedRental = await rental.save();

    res.json(updatedRental);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a rental (Admin only)
// @route   DELETE /api/rentals/:id
// @access  Private (Admin)
const deleteRental = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    // Restore watch quantity before deleting rental
    const watch = await Watch.findById(rental.watch);
    if (watch) {
      watch.quantity += 1;
      await watch.save();
    }

    await rental.deleteOne();
    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createRental,
  getRentals,
  getRentalById,
  updateRentalStatus,
  deleteRental,
};
