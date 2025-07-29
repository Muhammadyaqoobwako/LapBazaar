require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB URI
const MONGO_URI = 'mongodb+srv://M_yaqoob:sahil@cluster0.lrcrzmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to multiple databases
const connectDB = (dbName) =>
  mongoose.createConnection(`${MONGO_URI}&dbName=${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const usersDb = connectDB('Users');
const marketplaceDb = connectDB('Marketplace');
const sellDb = connectDB('Sell');
const repairDb = connectDB('Repair');
const displayDb = connectDB('DisplayLaptops');

// DB connection confirmation
usersDb.once('open', () => console.log('Connected to Users DB'));
marketplaceDb.once('open', () => console.log('Connected to Marketplace DB'));
sellDb.once('open', () => console.log('Connected to Sell DB'));
repairDb.once('open', () => console.log('Connected to Repair DB'));
displayDb.once('open', () => console.log('Connected to DisplayLaptops DB'));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const valid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    valid ? cb(null, true) : cb(new Error('Only JPEG, JPG, and PNG files allowed'));
  },
});

// Schemas and Models

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin', 'technician', 'dealer'], default: 'user' },
}, { collection: 'signup & login' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = usersDb.model('User', userSchema);

// Marketplace Laptop Schema
const laptopSchema = new mongoose.Schema({
  brand: String,
  model: String,
  price: Number,
  processor: String,
  ram: String,
  storage: String,
  condition: { type: String, enum: ['new', 'refurbished', 'used'], default: 'new' },
  images: [String],
  description: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  specs: {
    screenSize: String,
    graphics: String,
    weight: String,
    batteryLife: String,
  },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'Data of marketplace' });

const Laptop = marketplaceDb.model('Laptop', laptopSchema);

// Display Laptop Schema
const displayLaptopSchema = new mongoose.Schema({
  brand: String,
  model: String,
  price: Number,
  images: [String],
  createdAt: { type: Date, default: Date.now },
}, { collection: 'display_laptops' });

const DisplayLaptop = displayDb.model('DisplayLaptop', displayLaptopSchema);

// Repair Schema
const repairSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  deviceType: { type: String, enum: ['laptop', 'desktop', 'tablet'], default: 'laptop' },
  brand: String,
  model: String,
  issue: String,
  address: String,
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  estimatedCost: Number,
  createdAt: { type: Date, default: Date.now },
}, { collection: 'repairs' });

const Repair = repairDb.model('Repair', repairSchema);

// ===========================
// Auth Middleware
// ===========================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing or invalid token format' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.id; // changed to match token payload
    next();
  });
};

// ===========================
// Routes
// ===========================

// Auth
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already exists' });

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ success: true, message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

// Marketplace
app.get('/api/v1/laptops', async (req, res) => {
  try {
    const laptops = await Laptop.find().populate('seller', 'username email').sort({ createdAt: -1 });
    res.json({ success: true, data: laptops });
  } catch (err) {
    res.status(500).json({ error: 'Laptops fetch failed' });
  }
});

app.post('/api/v1/laptops', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const { brand, model, price, processor, ram, storage, condition, description, specs } = req.body;
    const images = req.files.map((f) => `/uploads/${f.filename}`);

    const newLaptop = new Laptop({
      brand,
      model,
      price,
      processor,
      ram,
      storage,
      condition,
      description,
      specs: JSON.parse(specs || '{}'),
      images,
      seller: req.userId,
    });

    await newLaptop.save();

    const displayLaptop = new DisplayLaptop({ brand, model, price, images });
    await displayLaptop.save();

    res.status(201).json({ success: true, message: 'Laptop listed', data: newLaptop });
  } catch (err) {
    res.status(500).json({ error: 'Laptop upload failed' });
  }
});

app.get('/api/v1/display-laptops', async (req, res) => {
  try {
    const laptops = await DisplayLaptop.find().sort({ createdAt: -1 });
    res.status(200).json({ data: laptops });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch display laptops' });
  }
});

// Repair Routes
app.get('/api/v1/repairs', async (req, res) => {
  try {
    const repairs = await Repair.find().sort({ createdAt: -1 });
    res.status(200).json({ data: repairs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
});

app.post('/api/v1/repairs', async (req, res) => {
  try {
    const { name, phone, email, deviceType, brand, model, issue, address } = req.body;
    if (!name || !phone || !email || !brand || !model || !issue || !address)
      return res.status(400).json({ error: 'All fields are required' });

    const repair = new Repair({ name, phone, email, deviceType, brand, model, issue, address });
    await repair.save();

    res.status(201).json({ success: true, message: 'Repair request submitted', data: repair });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit repair request' });
  }
});

app.patch('/api/v1/repairs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Repair.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Repair not found' });
    res.status(200).json({ message: 'Status updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Admin: View all repairs
app.get('/admin/all', async (req, res) => {
  try {
    const repairs = await Repair.find().sort({ createdAt: -1 });
    res.json({ success: true, data: repairs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError)
    return res.status(400).json({ error: 'Upload error: ' + err.message });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
