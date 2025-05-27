const asyncHandler = require('express-async-handler');
const Address = require('../models/addressModel');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require('../utils/errors');

// @desc    Create a new address
// @route   POST /api/addresses
// @access  Private (User)
const createAddress = asyncHandler(async (req, res, next) => {
  try {
    const {
      street_address, suburb, state, postcode,
    } = req.body;

    // Identify missing fields
    const missingFields = [];
    if (!street_address) missingFields.push('street_address');
    if (!suburb) missingFields.push('suburb');
    if (!state) missingFields.push('state');
    if (!postcode) missingFields.push('postcode');

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const address = await Address.create({
      street_address, suburb, state, postcode,
    });

    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
});

// @desc    Get all addresses (Admin only)
// @route   GET /api/addresses
// @access  Private (Admin)
const getAddresses = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const addresses = await Address.find();
    res.json(addresses);
  } catch (error) {
    next(error);
  }
});

// @desc    Get address by ID
// @route   GET /api/addresses/:id
// @access  Private (User)
const getAddressById = asyncHandler(async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    res.json(address);
  } catch (error) {
    next(error);
  }
});

// @desc    Update an address (Admin only)
// @route   PATCH /api/addresses/:id
// @access  Private (Admin)
const updateAddress = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const address = await Address.findById(req.params.id);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    Object.assign(address, req.body);
    await address.save();

    res.json(address);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete an address (Admin only)
// @route   DELETE /api/addresses/:id
// @access  Private (Admin)
const deleteAddress = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const address = await Address.findById(req.params.id);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    await address.deleteOne();
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
