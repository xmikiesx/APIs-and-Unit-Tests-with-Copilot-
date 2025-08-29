const jwt = require("jsonwebtoken");

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * JWT Authentication Middleware
 * Validates JWT tokens sent in Authorization header
 * If token is valid, continues with endpoint execution
 * If not, returns 401 error
 */
const authenticateToken = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers["authorization"];

  // Extract token from "Bearer TOKEN" format
  const token = authHeader && authHeader.split(" ")[1];

  // If no token provided
  if (!token) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
      message: "A valid JWT token is required to access this resource.",
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user information to request object
    req.user = decoded;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Token is invalid
    return res.status(401).json({
      error: "Invalid token.",
      message: "The provided JWT token is invalid or expired.",
    });
  }
};

/**
 * Optional middleware to generate JWT tokens for testing purposes
 * In a real application, this would be part of your login/authentication endpoint
 */
const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
  authenticateToken,
  generateToken,
};
