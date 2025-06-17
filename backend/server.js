const express = require('express');
const app = express();
// we can't use fetch and get to get api calls I suppose?
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DigiLocker login route - Just a mock for now
app.get('/digilocker/login', (req, res) => {
  // Redirect to the DigiLocker login page (in reality, you'd redirect the user here)
  // For now, we simulate that with a message.
  // Replace this with the actual DigiLocker login logic
  res.redirect('/digilocker/callback?hash=demo-fake-digilocker-hash-123');
});

// DigiLocker callback route - This will handle the response after successful login
app.get('/digilocker/callback', (req, res) => {
  // Capture authentication data, such as a hash or token, passed in the query string
  const authHash = req.query.hash;  // DigiLocker would send this after successful login

  if (!authHash) {
    return res.status(400).send('Authentication failed: Missing hash');
  }

  // Simulate processing the hash (e.g., storing it in a session, verifying it, etc.)
  console.log('Received DigiLocker hash:', authHash);

  // Respond back to the user with a success message
  res.send(`Authentication completed via DigiLocker. Hash: ${authHash}`);
});

// Root route (optional, just for testing if the server is working)
app.get('/', (req, res) => {
  res.send('DigiLocker Authentication Server is running!');
});

// Start the server on the port 5000 
const port = 5000; // Change port to 3000 or any unused port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
