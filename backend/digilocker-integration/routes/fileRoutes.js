const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { getBucket } = require('../utils/db');
const authenticate = require('../middleware/auth'); // updated import

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/gridfs', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(req.file.filename);
  const fileStream = fs.createReadStream(req.file.path);

  fileStream.pipe(uploadStream)
    .on('error', err => res.status(500).json({ message: 'Upload error', error: err.message }))
    .on('finish', () => res.status(200).json({ message: '✅ File uploaded to GridFS', filename: req.file.filename }));
});

router.get('/:filename', authenticate, (req, res) => {
  const bucket = getBucket();
  const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
  downloadStream.pipe(res).on('error', err =>
    res.status(404).json({ message: 'File not found', error: err.message }));
});

module.exports = router;
