const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

// MongoDB URI
const mongoURI = 'mongodb+srv://<username>:<password>@cluster0.lrcrzmp.mongodb.net/<dbname>?retryWrites=true&w=majority';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Init gfs
let gfs;
conn.once('open', () => {
  // Initialize stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads'); // Set the collection name
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'uploads', // Set the name of the collection
    };
  },
});

const upload = multer({ storage });

module.exports = { upload, gfs };
