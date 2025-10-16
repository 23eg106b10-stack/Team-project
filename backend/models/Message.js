const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
