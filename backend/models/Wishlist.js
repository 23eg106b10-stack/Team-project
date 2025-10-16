const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one wishlist per buyer
wishlistSchema.index({ buyer: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
