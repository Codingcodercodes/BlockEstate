const express = require('express');
const axios = require('axios');

const router = express.Router();

const { DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET, DIGILOCKER_REDIRECT_URI } = process.env;

router.get('/login', (req, res) => {
  const authUrl = `https://api.digilocker.gov.in/oauth2/authorize?client_id=${DIGILOCKER_CLIENT_ID}&redirect_uri=${encodeURIComponent(DIGILOCKER_REDIRECT_URI)}&response_type=code&scope=read`;
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    const response = await axios.post('https://api.digilocker.gov.in/oauth2/token', null, {
      params: {
        client_id: DIGILOCKER_CLIENT_ID,
        client_secret: DIGILOCKER_CLIENT_SECRET,
        code,
        redirect_uri: DIGILOCKER_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    req.session.access_token = response.data.access_token;
    res.send('✅ DigiLocker authenticated successfully');
  } catch (err) {
    console.error('DigiLocker callback error:', err.response?.data || err.message);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;

