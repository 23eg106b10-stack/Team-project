const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Admin = require('../models/Admin');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    // Get recent data
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentBookings = await Booking.find({})
      .populate('buyer', 'name')
      .populate('service', 'serviceName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('status totalAmount createdAt');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalServices,
        totalBookings,
        pendingBookings
      },
      recentData: {
        users: recentUsers,
        bookings: recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email phone role location businessName verified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { verified, active } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get all services (admin view)
// @route   GET /api/admin/services
// @access  Private (Admin only)
exports.getAdminServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (category) {
      query.category = category;
    }

    const services = await Service.find(query)
      .populate('seller', 'name email phone')
      .select('serviceName category pricing availability location seller createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      services,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// @desc    Delete service (admin)
// @route   DELETE /api/admin/services/:id
// @access  Private (Admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
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

// @desc    Get all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
exports.getAdminBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('service', 'serviceName category')
      .select('status totalAmount eventDate venue createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};
