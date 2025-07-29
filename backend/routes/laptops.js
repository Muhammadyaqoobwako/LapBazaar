const express = require('express');
const router = express.Router();
const { upload, gfs } = require('../grid'); // Import the GridFS setup
const Laptop = require('../models/Laptop');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// @desc    Create new laptop
// @route   POST /api/v1/laptops
// @access  Private
router.post(
  '/',
  [
    upload.array('images', 5), // Handle multiple image uploads
    body('brand', 'Brand is required').not().isEmpty(),
    body('model', 'Model is required').not().isEmpty(),
    body('price', 'Price is required').isNumeric(),
    body('processor', 'Processor is required').not().isEmpty(),
    body('ram', 'RAM is required').not().isEmpty(),
    body('storage', 'Storage is required').not().isEmpty(),
    body('condition', 'Condition is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get seller from authenticated user
      req.body.seller = req.user.id;

      // Get image IDs from GridFS
      const imageIds = req.files.map(file => file.id); // Store the file IDs

      // Create laptop
      const laptop = await Laptop.create({
        ...req.body,
        images: imageIds // Save the image IDs in the database
      });

      // Add laptop to user's listings
      await User.findByIdAndUpdate(req.user.id, {
        $push: { listings: laptop._id }
      });

      res.status(201).json({
        success: true,
        data: laptop
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
);

// @desc    Get all laptops
// @route   GET /api/v1/laptops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const laptops = await Laptop.find().populate('seller', 'name email phone');

    // Construct image URLs
    const laptopsWithUrls = await Promise.all(laptops.map(async (laptop) => {
      const images = await Promise.all(laptop.images.map(async (id) => {
        const file = await gfs.files.findOne({ _id: id });
        return file ? `http://localhost:5000/api/v1/laptops/image/${file.filename}` : null;
      }));
      return {
        ...laptop.toObject(),
        images: images.filter(Boolean) // Filter out null values
      };
    }));

    res.status(200).json({
      success: true,
      count: laptopsWithUrls.length,
      data: laptopsWithUrls
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get image by filename
// @route   GET /api/v1/laptops/image/:filename
// @access  Public
router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ success: false, error: 'No file exists' });
    }

    // Check if the file is an image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Create read stream
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ success: false, error: 'Not an image' });
    }
  });
});

module.exports = router;
