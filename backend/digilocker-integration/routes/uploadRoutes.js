const express = require('express');
const multer = require('multer');
const authenticateJWT = require('../middleware/auth'); // ✅ import the function

const router = express.Router();

// Store uploaded files in "uploads/" folder
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/'),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// In-memory storage for uploaded filenames
let uploadedFiles = [];

// POST /upload — Upload a document
router.post('/', authenticateJWT, upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  uploadedFiles.push(req.file.filename);
  res.json({ message: '📤 File uploaded successfully', filename: req.file.filename });
});

// GET /upload/user-documents — Get uploaded docs for current session
router.get('/user-documents', authenticateJWT, (req, res) => {
  res.json(uploadedFiles);
});

module.exports = router;
