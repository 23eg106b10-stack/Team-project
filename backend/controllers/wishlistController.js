const Wishlist = require('../models/Wishlist');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private (Buyer only)
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ buyer: req.user.id })
      .populate({
        path: 'services.service',
        populate: {
          path: 'seller',
          select: 'name businessName phone email location'
        }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ buyer: req.user.id, services: [] });
    }

    res.status(200).json({
      success: true,
      count: wishlist.services.length,
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message
    });
  }
};

// @desc    Add service to wishlist
// @route   POST /api/wishlist/:serviceId
// @access  Private (Buyer only)
exports.addToWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ buyer: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ buyer: req.user.id, services: [] });
    }

    // Check if service already in wishlist
    const serviceExists = wishlist.services.some(
      item => item.service.toString() === req.params.serviceId
    );

    if (serviceExists) {
      return res.status(400).json({
        success: false,
        message: 'Service already in wishlist'
      });
    }

    wishlist.services.push({ service: req.params.serviceId });
    await wishlist.save();

    wishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'services.service',
        populate: {
          path: 'seller',
          select: 'name businessName phone email'
        }
      });

    res.status(200).json({
      success: true,
      message: 'Service added to wishlist',
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
};

// @desc    Remove service from wishlist
// @route   DELETE /api/wishlist/:serviceId
// @access  Private (Buyer only)
exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.services = wishlist.services.filter(
      item => item.service.toString() !== req.params.serviceId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Service removed from wishlist',
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private (Buyer only)
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.services = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist',
      error: error.message
    });
  }
};
