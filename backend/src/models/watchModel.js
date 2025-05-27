const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1000,
    max: new Date().getFullYear(),
  },
  rental_day_price: {
    type: Number,
    required: true,
    min: 0,
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good',
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 5, // Ensure watches have at least 1 available
  },
}, { timestamps: true });

const WatchModel = mongoose.model('Watch', watchSchema);
module.exports = WatchModel;
