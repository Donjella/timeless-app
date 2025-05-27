const mongoose = require('mongoose');

// Define the brand schema
const brandSchema = new mongoose.Schema(
  {
    brand_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create and export the Brand model
const BrandModel = mongoose.model('Brand', brandSchema);

module.exports = BrandModel;
