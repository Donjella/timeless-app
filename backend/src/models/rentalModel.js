const mongoose = require('mongoose');

// Define the rental schema
const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    watch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Watch',
      required: true,
    },
    rental_start_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    rental_end_date: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          if (!this.rental_start_date) return false;
          return this.rental_start_date <= value;
        },
        message: 'Rental end date must be after or equal to the start date.',
      },
    },
    rental_status: {
      type: String,
      required: true,
      enum: ['Pending', 'Active', 'Completed'],
      default: 'Pending',
    },
    total_rental_price: {
      type: Number,
      required: true,
      min: 0,
    },
    collection_mode: {
      type: String,
      required: true,
      enum: ['Pickup', 'Delivery'],
      default: 'Pickup',
    },
  },
  {
    timestamps: true,
  },
);

// Calculate rental duration in days
rentalSchema.methods.getRentalDuration = function calculateDurationInDays() {
  if (!this.rental_start_date || !this.rental_end_date) return 0;

  const startDate = new Date(this.rental_start_date);
  const endDate = new Date(this.rental_end_date);
  const diffTime = endDate - startDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Create and export the Rental model
const RentalModel = mongoose.model('Rental', rentalSchema);

module.exports = RentalModel;
