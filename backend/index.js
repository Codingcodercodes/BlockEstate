// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processAssets } from '../scripts/processAssets.js'; // ✅ Adjust path as needed

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample property data
const properties = [
  {
    id: 1,
    name: 'Palm Grove Estate',
    description: 'A peaceful plot near the river.',
    landTokenId: 101,
  },
  {
    id: 2,
    name: 'Greenfield Meadows',
    description: 'Spacious land with a great view.',
    landTokenId: 102,
  },
  {
    id: 3,
    name: 'Sunrise Acres',
    description: 'Ideal for farming and eco-housing.',
    landTokenId: 103,
  },
];

// Root route
app.get('/', (req, res) => {
  res.send('🌐 Real Estate Backend is live!');
});



app.get('/api/properties', (req, res) => {
  res.json(properties);
});

app.get('/api/properties/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const property = properties.find((p) => p.id === id);

  if (property) {
    res.json(property);
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

// ✅ NEW: Trigger asset processing (e.g. minting/transferring)
app.post('/api/process-assets', async (req, res) => {
  try {
    await processAssets();
    res.status(200).json({ message: 'Assets processed successfully' });
  } catch (error) {
    console.error('❌ Error processing assets:', error);
    res.status(500).json({ error: 'Asset processing failed' });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "BlockEstate API is working"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
