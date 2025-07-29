const mongoose = require('mongoose');

const laptopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  }
}, {
  collection: 'laptops',
  timestamps: true
});

module.exports = mongoose.model('Laptop', laptopSchema);
