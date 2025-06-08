const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'sample-secret';

/**
 * Middleware to authenticate requests using JWT tokens.
 *
 * Expected Authorization header format: "Bearer <token>"
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1]; // Extract token after "Bearer"

  if (!token) {
    return res.status(401).json({ error: 'Token not found in Authorization header' });
  }

  jwt.verify(token, SECRET, (err, decodedUser) => {
    if (err) {
      // Optional: Log the error for debugging
      console.error('JWT verification failed:', err.message);

      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Attach decoded user info to the request object
    req.user = decodedUser;

    // Proceed to next middleware or route handler
    next();
  });
};

module.exports = authenticateJWT;
