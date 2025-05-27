const express = require('express');

const router = express.Router();
const {
  createPayment,
  getPayments,
  getUserPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Authenticated User Routes (Requires Login)
router.post('/', protect, createPayment); // Users can make a payment
router.get('/user/me', protect, getUserPayments); // Users can view all their payments
router.get('/:id', protect, getPaymentById); // Users can view their payment

// Admin Only Routes (Requires Admin Role)
router.get('/', protect, admin, getPayments); // Admin can view all payments
router.patch('/:id', protect, admin, updatePaymentStatus); // Admin can update payment status
router.delete('/:id', protect, admin, deletePayment); // Admin can delete a payment

module.exports = router;
