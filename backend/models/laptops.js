const mongoose = require('mongoose');

const laptopSchema = new mongoose.Schema({
  brand: String,
  model: String,
  price: Number,
  description: String,
  specifications: {
    cpu: String,
    ram: String,
    storage: String,
    screen: String,
    battery: String,
  },
  images: [String], // array of image filenames (e.g., ['uploads/image1.jpg'])
}, {
  timestamps: true,
});

module.exports = mongoose.model('Laptops', laptopSchema);
