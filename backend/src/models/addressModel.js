const mongoose = require('mongoose');

// Define the Address schema
const addressSchema = new mongoose.Schema(
  {
    street_address: {
      type: String,
      required: true,
      trim: true,
    },
    suburb: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      enum: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
    },
    postcode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}$/, 'Please provide a valid 4-digit Australian postcode'],
    },
  },
  {
    timestamps: true,
  },
);

// Create and export the Address model
const AddressModel = mongoose.model('Address', addressSchema);
module.exports = AddressModel;
