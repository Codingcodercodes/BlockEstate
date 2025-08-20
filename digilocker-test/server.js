const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('✅ Backend is up and running!');
});
app.get('/digilocker/login',(req, res) => {
  console.log('Login route hit!');
  res.redirect('/digilocker/callback?hash=mocked-auth-hash');
});
app.get('/digilocker/callback',(req, res) => {
  const hash = req.query.hash;
  res.send(`✅ DigiLocker Auth Successful! Hash: ${hash}`);
});
const PORT = 5000;
app.listen(PORT,() => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
