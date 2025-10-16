const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventDate: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  eventType: {
    type: String,
    required: [true, 'Please specify event type']
  },
  venue: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  duration: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days']
    }
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Please provide estimated number of guests']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'advance-paid', 'fully-paid', 'refunded'],
    default: 'pending'
  },
  specialRequirements: String,
  cancellationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
