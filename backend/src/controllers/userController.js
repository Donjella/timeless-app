const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const Address = require('../models/addressModel');
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} = require('../utils/errors');

// @desc    Register a new user with required address
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array().map((err) => err.msg).join(', '));
    }

    const {
      first_name, last_name, email, password, phone_number,
      street_address, suburb, state, postcode,
    } = req.body;

    // Identify missing fields
    const missingFields = [];
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!street_address) missingFields.push('street_address');
    if (!suburb) missingFields.push('suburb');
    if (!state) missingFields.push('state');
    if (!postcode) missingFields.push('postcode');

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ConflictError('User with this email already exists');
    }

    const address = await Address.create({
      street_address, suburb, state, postcode,
    });

    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      phone_number,
      address: address._id,
    });

    res.status(201).json({
      _id: user._id,
      first_name,
      last_name,
      email,
      phone_number,
      role: user.role,
      address,
      token: user.generateToken(),
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('address');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      address: user.address,
      token: user.generateToken(),
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const users = await User.find().populate('address').select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('address');
    if (!user) throw new NotFoundError('User not found');

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('address');
    if (!user) throw new NotFoundError('User not found');

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile (PATCH)
// @route   PATCH /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new NotFoundError('User not found');

    Object.assign(user, req.body);

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.body.street_address || req.body.suburb || req.body.state || req.body.postcode) {
      let address = await Address.findById(user.address);

      if (address) {
        Object.assign(address, {
          street_address: req.body.street_address,
          suburb: req.body.suburb,
          state: req.body.state,
          postcode: req.body.postcode,
        });
        await address.save();
      } else {
        address = await Address.create({
          street_address: req.body.street_address,
          suburb: req.body.suburb,
          state: req.body.state,
          postcode: req.body.postcode,
        });
        user.address = address._id;
      }
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('address');
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/role/:id
// @access  Private/Admin
const updateUserRole = asyncHandler(
  async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Access denied. Admin only.');
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true },
      );

      if (!updatedUser) throw new NotFoundError('User not found');

      res.json({ message: `User role updated to ${updatedUser.role}` });
    } catch (error) {
      next(error);
    }
  },
);

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied. Admin only.');
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Optional: Delete associated address
    if (user.address) {
      await Address.findByIdAndDelete(user.address);
    }

    res.status(200).json({
      message: 'User successfully deleted',
      deletedUserId: user._id,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  deleteUser,
};
