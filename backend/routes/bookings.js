const express = require('express');
const {
  createBooking,
  getBuyerBookings,
  getSellerBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.get('/buyer', protect, authorize('buyer'), getBuyerBookings);
router.get('/seller', protect, authorize('seller'), getSellerBookings);
router.get('/:id', protect, getBooking);

router.post('/', protect, authorize('buyer'), createBooking);
router.put('/:id/status', protect, authorize('seller'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('buyer'), cancelBooking);

module.exports = router;
