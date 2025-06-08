const { MongoClient, GridFSBucket } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(mongoUri);

let bucket;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('fileDB');
    bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

function getBucket() {
  return bucket;
}

module.exports = { connectDB, getBucket };
