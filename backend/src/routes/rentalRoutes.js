const express = require('express');

const router = express.Router();
const {
  createRental,
  getRentals,
  getRentalById,
  updateRentalStatus,
  deleteRental,
} = require('../controllers/rentalController');
const { protect, admin } = require('../middleware/authMiddleware');

// Authenticated User Routes (Requires Login)
router.post('/', protect, createRental);
router.get('/:id', protect, getRentalById);

// Admin Only Routes (Requires Admin Role)
router.get('/', protect, admin, getRentals);
router.patch('/:id', protect, admin, updateRentalStatus);
router.delete('/:id', protect, admin, deleteRental);

module.exports = router;
