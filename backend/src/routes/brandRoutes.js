const express = require('express');

const router = express.Router();
const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getBrands);
router.get('/:id', getBrandById);

// Admin Only Routes (Requires Admin Role)
router.post('/', protect, admin, createBrand);
router.put('/:id', protect, admin, updateBrand);
router.delete('/:id', protect, admin, deleteBrand);

module.exports = router;
