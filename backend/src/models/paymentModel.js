const mongoose = require('mongoose');
const { setPaymentDateOnComplete } = require('../middleware/paymentMiddleware');

// Define the payment schema
const paymentSchema = new mongoose.Schema(
  {
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_status: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    payment_date: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      trim: true,
    },
    payment_method: {
      type: String,
      enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'],
      default: 'Credit Card',
    },
    transaction_id: {
      type: String,
      trim: true,
      validate: {
        validator(v) {
          return this.payment_status !== 'Completed' || (v && v.length > 0);
        },
        message: 'Transaction ID is required for completed payments.',
      },
    },
  },
  {
    timestamps: true,
  },
);

//
paymentSchema.pre('save', setPaymentDateOnComplete);

// Create and export the Payment model

const PaymentModel = mongoose.model('Payment', paymentSchema);

module.exports = PaymentModel;
