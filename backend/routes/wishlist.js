const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlistController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All wishlist routes require buyer authentication
router.get('/', protect, authorize('buyer'), getWishlist);
router.post('/:serviceId', protect, authorize('buyer'), addToWishlist);

router.delete('/:serviceId', protect, authorize('buyer'), removeFromWishlist);
router.delete('/', protect, authorize('buyer'), clearWishlist);

module.exports = router;
