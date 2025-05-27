const express = require('express');

const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  getUsers,
  getUserById,
  deleteUser, // New function
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes (No Authentication Required)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Authenticated User Routes (Requires Login)
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);

// Admin Only Routes (Requires Admin Role)
router.get('/', protect, admin, getUsers); // Admin can get all users
router.get('/:id', protect, admin, getUserById); // Admin can get user by ID
router.patch('/role/:id', protect, admin, updateUserRole); // Admin can update user role
router.delete('/:id', protect, admin, deleteUser); // Admin can delete users

module.exports = router;
