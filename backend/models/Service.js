const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceName: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Flowers', 'Décor', 'Priest Services', 'Music/Band', 'Tent & Furniture', 'Chairs & Basic Necessities']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Please provide a base price']
    },
    priceType: {
      type: String,
      enum: ['per hour', 'per day', 'per event', 'per item'],
      default: 'per event'
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  availability: {
    type: Boolean,
    default: true
  },
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  features: [String],
  minimumBookingDuration: String,
  advanceBookingRequired: {
    type: Number,
    default: 1 // days
  },
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
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
