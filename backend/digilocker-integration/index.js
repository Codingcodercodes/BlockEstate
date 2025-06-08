// server.js

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MongoClient, GridFSBucket } = require('mongodb');

dotenv.config(); // Load environment variables from .env

const app = express();

// Environment variables with fallback
const {
  DIGILOCKER_CLIENT_ID,
  DIGILOCKER_CLIENT_SECRET,
  DIGILOCKER_REDIRECT_URI,
  MONGODB_URI = 'mongodb://localhost:27017',
} = process.env;

// Create uploads directory if it does not exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for disk storage (files saved to uploads/)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const uploadDisk = multer({ storage: diskStorage });

// Multer setup for memory storage (files buffered in RAM, for GridFS upload)
const uploadMemory = multer({ storage: multer.memoryStorage() });

// MongoDB client and GridFS bucket placeholders
let client;
let bucket;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve frontend static files if any

// ===== ROUTES =====

// Root route: basic welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the DigiLocker OAuth Integration. Visit /digilocker/login to begin.');
});

// DigiLocker OAuth2 Login redirect
app.get('/digilocker/login', (req, res) => {
  if (!DIGILOCKER_CLIENT_ID || !DIGILOCKER_REDIRECT_URI) {
    return res.status(500).send('Server configuration error: missing DigiLocker client ID or redirect URI.');
  }
  const authUrl = `https://api.digilocker.gov.in/oauth2/authorize?client_id=${encodeURIComponent(DIGILOCKER_CLIENT_ID)}&redirect_uri=${encodeURIComponent(DIGILOCKER_REDIRECT_URI)}&response_type=code&scope=read`;
  res.redirect(authUrl);
});

// DigiLocker OAuth2 callback to exchange code for token
app.get('/digilocker/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code missing in callback');

  try {
    const tokenResponse = await axios.post('https://api.digilocker.gov.in/oauth2/token', null, {
      params: {
        client_id: DIGILOCKER_CLIENT_ID,
        client_secret: DIGILOCKER_CLIENT_SECRET,
        code,
        redirect_uri: DIGILOCKER_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
    });

    const { access_token, expires_in, refresh_token } = tokenResponse.data;

    // TODO: securely store tokens (DB, session, or secure storage)
    // For now, just display success and token info (remove in production)
    res.send(`
      <h2>Authentication successful!</h2>
      <p>Access Token: <code>${access_token}</code></p>
      <p>Expires in: ${expires_in} seconds</p>
      <p>Refresh Token: <code>${refresh_token}</code></p>
      <p>You can now use this token to call DigiLocker APIs securely.</p>
    `);
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

// Upload page - simple HTML form for testing
app.get('/upload', (req, res) => {
  res.send(`
    <h2>Upload a file (Disk Storage)</h2>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="file" required />
      <button type="submit">Upload to Disk</button>
    </form>
    <h2>Upload a file (GridFS Storage)</h2>
    <form method="POST" action="/upload/gridfs" enctype="multipart/form-data">
      <input type="file" name="file" required />
      <button type="submit">Upload to GridFS</button>
    </form>
  `);
});

// Upload file to disk storage
app.post('/upload', uploadDisk.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.send({
    message: 'File uploaded to disk successfully',
    filename: req.file.filename,
    path: req.file.path,
  });
});

// Upload file to GridFS (MongoDB)
app.post('/upload/gridfs', uploadMemory.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  const uploadStream = bucket.openUploadStream(req.file.originalname);

  uploadStream.end(req.file.buffer);

  uploadStream.on('error', (err) => {
    console.error('GridFS upload error:', err);
    res.status(500).send('Failed to upload file to GridFS.');
  });

  uploadStream.on('finish', () => {
    res.send({
      message: 'File uploaded to GridFS successfully',
      filename: req.file.originalname,
    });
  });
});

// Serve files from GridFS by filename
app.get('/files/:filename', (req, res) => {
  try {
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);

    downloadStream.on('error', (err) => {
      console.error('File not found:', err);
      res.status(404).send('File not found');
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error retrieving file:', err);
    res.status(500).send('Error retrieving file');
  }
});

// Start server and connect to MongoDB
async function startServer() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB at', MONGODB_URI);

    bucket = new GridFSBucket(client.db('fileDB'), {
      bucketName: 'uploads',
    });

    app.listen(3000, () => {
      console.log('✅ Server running at http://localhost:3000');
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

startServer();
