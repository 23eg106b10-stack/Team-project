const Service = require('../models/Service');

// @desc    Get all services with filters
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { category, city, search, minPrice, maxPrice } = req.query;
    
    let query = { availability: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by city
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    // Search in service name or description
    if (search) {
      query.$or = [
        { serviceName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = Number(maxPrice);
    }

    const services = await Service.find(query)
      .populate('seller', 'name businessName phone email location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('seller', 'name businessName phone email location businessDescription');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Seller only)
exports.createService = async (req, res) => {
  try {
    // Add seller to request body
    req.body.seller = req.user.id;

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Seller only)
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user is service owner
    if (service.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Seller only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user is service owner
    if (service.seller.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
};

// @desc    Get seller's services
// @route   GET /api/services/seller/my-services
// @access  Private (Seller only)
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ seller: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// @desc    Get services by location (nearby)
// @route   GET /api/services/nearby
// @access  Public
exports.getNearbyServices = async (req, res) => {
  try {
    const { latitude, longitude, category, maxDistance = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    let query = { availability: true };
    
    if (category) {
      query.category = category;
    }

    // Find services within radius (simplified - in production use geospatial queries)
    const services = await Service.find(query)
      .populate('seller', 'name businessName phone email location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby services',
      error: error.message
    });
  }
};
