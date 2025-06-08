const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
  console.log('Connected to MongoDB');
  return client;
}

module.exports = { connectDB, client };
