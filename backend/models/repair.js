const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10,15}$/, 'Invalid phone number'],
  },
  email: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Invalid email address'],
  },
  deviceType: {
    type: String,
    enum: ['laptop', 'desktop', 'tablet', 'mobile'],
    default: 'laptop',
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  issue: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  estimatedCost: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'repairs',
});

module.exports = mongoose.model('Repair', repairSchema);
