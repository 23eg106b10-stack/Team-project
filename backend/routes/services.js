const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getNearbyServices
} = require('../controllers/serviceController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getServices);
router.get('/nearby', getNearbyServices);
router.get('/:id', getService);

// Protected routes
router.get('/seller/my-services', protect, authorize('seller'), getMyServices);
router.post('/', protect, authorize('seller'), createService);
router.put('/:id', protect, authorize('seller'), updateService);
router.delete('/:id', protect, authorize('seller'), deleteService);

module.exports = router;
