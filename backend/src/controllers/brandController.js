const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} = require('../utils/errors');

// @desc    Create a new brand (Admin only)
// @route   POST /api/brands
// @access  Private (Admin)
const createBrand = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const { brand_name } = req.body;

    if (!brand_name) {
      throw new ValidationError('Brand name is required');
    }

    // Check if brand already exists
    const brandExists = await Brand.findOne({
      brand_name: { $regex: new RegExp(`^${brand_name}$`, 'i') },
    });

    if (brandExists) {
      throw new ConflictError('Brand already exists');
    }

    const brand = await Brand.create({ brand_name });

    if (brand) {
      res.status(201).json(brand);
    } else {
      throw new ValidationError('Invalid brand data');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res, next) => {
  try {
    const brands = await Brand.find({}).sort({ brand_name: 1 });
    res.json(brands);
  } catch (error) {
    next(error);
  }
});

// @desc    Get a single brand by ID
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    res.json(brand);
  } catch (error) {
    next(error);
  }
});

// @desc    Update a brand (Admin only)
// @route   PUT /api/brands/:id
// @access  Private (Admin)
const updateBrand = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const { brand_name } = req.body;

    if (!brand_name) {
      throw new ValidationError('Brand name is required');
    }

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    // Check if updated name already exists (excluding current brand)
    const nameExists = await Brand.findOne({
      brand_name: { $regex: new RegExp(`^${brand_name}$`, 'i') },
      _id: { $ne: req.params.id },
    });

    if (nameExists) {
      throw new ConflictError('Brand name already exists');
    }

    brand.brand_name = brand_name;

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a brand (Admin only)
// @route   DELETE /api/brands/:id
// @access  Private (Admin)
const deleteBrand = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    await brand.deleteOne();
    res.json({ message: 'Brand removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
