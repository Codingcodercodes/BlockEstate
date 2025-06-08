const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// GridFS storage config
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      metadata: { userId: req.user.id },
      bucketName: 'uploads',
    };
  },
});

const upload = multer({ storage });

router.post('/upload/gridfs', auth, upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});

router.get('/documents', auth, async (req, res) => {
  const conn = mongoose.connection;
  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });

  const files = await conn.db.collection('uploads.files').find({
    'metadata.userId': req.user.id,
  }).toArray();

  const docs = files.map(file => ({
    _id: file._id,
    filename: file.filename,
    link: `/file/${file._id}`,
  }));

  res.json(docs);
});

router.get('/file/:id', async (req, res) => {
  const conn = mongoose.connection;
  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });

  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (error) {
    res.status(404).send('File not found');
  }
});

module.exports = router;
