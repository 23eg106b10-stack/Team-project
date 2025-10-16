const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
