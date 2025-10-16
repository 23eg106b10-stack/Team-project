const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Buyer only)
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, eventDate, eventType, venue, duration, numberOfGuests, totalAmount, specialRequirements } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Create booking
    const booking = await Booking.create({
      buyer: req.user.id,
      service: serviceId,
      seller: service.seller,
      eventDate,
      eventType,
      venue,
      duration,
      numberOfGuests,
      totalAmount,
      specialRequirements
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'serviceName category pricing images')
      .populate('seller', 'name businessName phone email')
      .populate('buyer', 'name phone email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Get all bookings for buyer
// @route   GET /api/bookings/buyer
// @access  Private (Buyer only)
exports.getBuyerBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { buyer: req.user.id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'serviceName category pricing images')
      .populate('seller', 'name businessName phone email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get all bookings for seller
// @route   GET /api/bookings/seller
// @access  Private (Seller only)
exports.getSellerBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { seller: req.user.id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'serviceName category pricing')
      .populate('buyer', 'name phone email location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'serviceName category pricing images description')
      .populate('seller', 'name businessName phone email location')
      .populate('buyer', 'name phone email location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is booking owner or service owner
    if (booking.buyer.toString() !== req.user.id && booking.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Seller only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is service owner
    if (booking.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    booking = await Booking.findById(booking._id)
      .populate('service', 'serviceName category')
      .populate('buyer', 'name phone email');

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Buyer only)
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is booking owner
    if (booking.buyer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};
