require('dotenv').config();
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { MongoClient, GridFSBucket } = require('mongodb');
const algosdk = require('algosdk');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// --- Multer Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// --- MongoDB Setup ---
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(mongoUri);
let bucket;
async function connectDB() {
  try {
    await client.connect();
    const db = client.db('fileDB');
    bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}
connectDB();

// --- Algorand Setup ---
const algodToken = (process.env.ALGOD_TOKEN || '').trim();
const algodServer = (process.env.ALGOD_SERVER || '').trim();
const algodPort = process.env.ALGOD_PORT ? Number(process.env.ALGOD_PORT) : null;
const senderMnemonic = (process.env.SENDER_MNEMONIC || '').trim();



let algodClient = null;
if (!algodServer || !/^https?:\/\//.test(algodServer) || !senderMnemonic || !algodPort) {
  console.warn('⚠️ ALGO environment variables not fully configured. /api/transact will fail.');
} else {
  try {
    algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    console.log('✅ Algod client initialized');
  } catch (err) {
    console.error('❌ Failed to initialize Algod client:', err.message);
  }
}
// --- DigiLocker Config ---
const DIGILOCKER_CLIENT_ID = process.env.DIGILOCKER_CLIENT_ID || 'your-client-id';
const DIGILOCKER_CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET || 'your-client-secret';
const DIGILOCKER_REDIRECT_URI = process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:3000/digilocker/callback';

// --- JWT Setup ---
const JWT_SECRET = process.env.JWT_SECRET || 'sample-secret';
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// --- Routes ---

app.get('/', (req, res) => {
  res.send('🚀 Server is up and running');
});

// DigiLocker
app.get('/digilocker/login', (req, res) => {
  const authUrl = `https://api.digilocker.gov.in/oauth2/authorize?client_id=${DIGILOCKER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    DIGILOCKER_REDIRECT_URI
  )}&response_type=code&scope=read`;
  res.redirect(authUrl);
});

app.get('/digilocker/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code missing');
  try {
    const response = await axios.post(
      'https://api.digilocker.gov.in/oauth2/token',
      null,
      {
        params: {
          client_id: DIGILOCKER_CLIENT_ID,
          client_secret: DIGILOCKER_CLIENT_SECRET,
          code,
          redirect_uri: DIGILOCKER_REDIRECT_URI,
          grant_type: 'authorization_code',
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    req.session.access_token = response.data.access_token;
    res.send('✅ Authentication successful');
  } catch (error) {
    console.error('❌ DigiLocker auth error:', error.response?.data || error.message);
    res.status(500).send('❌ Authentication failed');
  }
});

// JWT Token
app.post('/auth/token', (req, res) => {
  const { username, password } = req.body;
  if (username === 'sampleUser' && password === 'samplePassword') {
    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ access_token: token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// File Upload
app.post('/upload/gridfs', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const uploadStream = bucket.openUploadStream(req.file.filename);
  const fileStream = fs.createReadStream(req.file.path);

  fileStream
    .pipe(uploadStream)
    .on('error', (err) => {
      console.error('GridFS upload error:', err);
      res.status(500).json({ message: '❌ Upload error', error: err.message });
    })
    .on('finish', () => {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to remove temp file:', unlinkErr);
      });
      res.status(200).json({ message: '✅ File uploaded', filename: req.file.filename });
    });
});

// File Download
app.get('/files/:filename', authenticate, (req, res) => {
  const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
  downloadStream.on('error', (err) => {
    console.error('GridFS download error:', err);
    res.status(404).json({ message: 'File not found', error: err.message });
  });
  downloadStream.pipe(res);
});

// Document Management (In-memory)
let userDocuments = [];
app.post('/documents', authenticate, (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ message: 'Both name and type are required' });

  const newDoc = { name, type };
  userDocuments.push(newDoc);
  res.status(201).json({ message: 'Document added', document: newDoc });
});

app.get('/documents', authenticate, (req, res) => {
  res.json(userDocuments);
});

// Property Management (In-memory)
let properties = [];
let idCounter = 1;

app.post('/create', (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) return res.status(400).json({ message: 'Name and location required' });

  const newProperty = { id: idCounter++, name, location };
  properties.push(newProperty);
  res.status(201).json({ newProperty });
});

// Algorand Transactions
app.post('/api/transact', authenticate, async (req, res) => {
  if (!algodClient) {
    return res.status(500).json({ error: 'Algod client not initialized' });
  }

  const { receiver, amount } = req.body;
  if (!receiver || !amount) {
    return res.status(400).json({ message: 'Receiver and amount are required' });
  }





  
  try {
    const senderAccount = algosdk.mnemonicToSecretKey(senderMnemonic);
    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: senderAccount.addr,
      to: receiver,
      amount: algosdk.algosToMicroalgos(Number(amount)),
      suggestedParams,
    });

    const signedTxn = txn.signTxn(senderAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);

    res.status(200).json({ message: '✅ Transaction successful', txId });
  } catch (err) {
    console.error('Transaction error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
