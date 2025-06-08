const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'sample-secret';

router.post('/token', (req, res) => {
  const { username, password } = req.body;
  if (username === 'sampleUser' && password === 'samplePassword') {
    const token = jwt.sign({ user: username }, SECRET, { expiresIn: '1h' });
    res.json({ access_token: token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
