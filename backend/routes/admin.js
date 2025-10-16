const express = require('express');
const {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAdminServices,
  deleteService,
  getAdminBookings
} = require('../controllers/adminController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Admin = require('../models/Admin');

// Custom admin auth middleware
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Public admin routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/dashboard', protect, adminAuth, getDashboardStats);
router.get('/users', protect, adminAuth, getUsers);
router.get('/users/:id', protect, adminAuth, getUserDetails);
router.put('/users/:id/status', protect, adminAuth, updateUserStatus);
router.delete('/users/:id', protect, adminAuth, deleteUser);

router.get('/services', protect, adminAuth, getAdminServices);
router.delete('/services/:id', protect, adminAuth, deleteService);

router.get('/bookings', protect, adminAuth, getAdminBookings);

module.exports = router;
