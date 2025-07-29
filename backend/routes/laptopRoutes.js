const express = require('express');
const multer = require('multer');
const Laptop = require('../models/laptops');
const router = express.Router();

// Image upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// POST - Add new laptop
router.post('/display-laptops', upload.array('images', 5), async (req, res) => {
  try {
    const imagePaths = req.files.map(file => file.path);

    const newLaptop = new Laptop({
      brand: req.body.brand,
      model: req.body.model,
      price: req.body.price,
      processor: req.body.processor,
      ram: req.body.ram,
      storage: req.body.storage,
      condition: req.body.condition,
      description: req.body.description,
      images: imagePaths
    });

    await newLaptop.save();
    res.status(201).json({ message: 'Laptop uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err });
  }
});

// GET - Fetch all laptops
router.get('/', async (req, res) => {
  try {
    const laptops = await Laptop.find();
    res.json(laptops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laptops' });
  }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
    res.json(laptop);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laptop' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Laptop.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Laptop not found' });
    res.json({ message: 'Laptop deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete laptop' });
  }
});

module.exports = router;
