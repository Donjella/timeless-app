const asyncHandler = require('express-async-handler');
const Payment = require('../models/paymentModel');
const Rental = require('../models/rentalModel');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require('../utils/errors');

// Valid payment methods
const VALID_PAYMENT_METHODS = ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'];

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res, next) => {
  try {
    const { rental_id, amount, payment_method } = req.body;

    // Identify missing fields
    const missingFields = [];
    if (!rental_id) missingFields.push('rental_id');
    if (!amount) missingFields.push('amount');
    if (!payment_method) missingFields.push('payment_method');

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate payment method
    if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
      throw new ValidationError(`Invalid payment method. Supported methods are: ${VALID_PAYMENT_METHODS.join(', ')}`);
    }

    // Ensure the rental exists
    const rental = await Rental.findById(rental_id);
    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    // Ensure user owns the rental or is an admin
    if (rental.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to create payment for this rental');
    }

    // Create payment with the rental field instead of rental_id
    const payment = await Payment.create({
      rental: rental_id, // Changed from rental_id to rental
      amount,
      payment_method,
      payment_status: 'Completed', // Your schema uses 'Completed' not 'Paid'
      transaction_id: `TX-${Date.now()}`, // Generate a transaction ID since it's required
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin)
const getPayments = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized as admin');
    }

    const payments = await Payment.find().populate('rental');
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user's payments
// @route   GET /api/payments/user/me
// @access  Private
const getUserPayments = asyncHandler(async (req, res, next) => {
  try {
    // Find all rentals belonging to the user
    const userRentals = await Rental.find({ user: req.user._id });

    // Get all rental IDs
    const rentalIds = userRentals.map((rental) => rental._id);

    // Find all payments for these rentals
    const payments = await Payment.find({ rental: { $in: rentalIds } })
      .populate('rental')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res, next) => {
  try {
    // First populate the payment with rental information
    const payment = await Payment.findById(req.params.id).populate({
      path: 'rental',
      populate: { path: 'user' },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Check if user is admin OR the payment belongs to the user
    if (req.user.role === 'admin' || payment.rental.user._id.toString() === req.user._id.toString()) {
      res.json(payment);
    } else {
      throw new ForbiddenError('Not authorized to view this payment');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Update payment status
// @route   PATCH /api/payments/:id
// @access  Private (Admin)
const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized as admin');
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    payment.payment_status = req.body.payment_status || payment.payment_status;

    // If completing the payment, ensure a transaction ID is provided
    if (payment.payment_status === 'Completed' && !payment.transaction_id) {
      if (req.body.transaction_id) {
        payment.transaction_id = req.body.transaction_id;
      } else {
        throw new ValidationError('Transaction ID is required for completed payments');
      }
    }

    const updatedPayment = await payment.save();
    res.json(updatedPayment);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
const deletePayment = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized as admin');
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    await payment.deleteOne();
    res.json({ message: 'Payment removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createPayment,
  getPayments,
  getUserPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
};
