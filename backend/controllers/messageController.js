const Message = require('../models/Message');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, serviceId, bookingId, subject, message } = req.body;

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      service: serviceId,
      booking: bookingId,
      subject,
      message
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('service', 'serviceName')
      .populate('booking', 'eventDate eventType');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Get all messages for user (inbox)
// @route   GET /api/messages/inbox
// @access  Private
exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.id })
      .populate('sender', 'name email role businessName')
      .populate('service', 'serviceName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Get sent messages
// @route   GET /api/messages/sent
// @access  Private
exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate('receiver', 'name email role businessName')
      .populate('service', 'serviceName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sent messages',
      error: error.message
    });
  }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Private
exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email phone role businessName')
      .populate('receiver', 'name email phone role businessName')
      .populate('service', 'serviceName category')
      .populate('booking', 'eventDate eventType status');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Make sure user is sender or receiver
    if (message.sender._id.toString() !== req.user.id && message.receiver._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this message'
      });
    }

    // Mark as read if receiver is viewing
    if (message.receiver._id.toString() === req.user.id && !message.isRead) {
      message.isRead = true;
      message.readAt = Date.now();
      await message.save();
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};
