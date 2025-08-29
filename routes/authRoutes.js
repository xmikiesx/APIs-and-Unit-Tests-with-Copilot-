const express = require("express");
const router = express.Router();
const { generateToken } = require("../middleware/auth");

/**
 * POST /auth/login
 * Simple login endpoint that generates a JWT token
 * In a real application, this would validate credentials against a database
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple validation (in production, validate against database)
  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  // For demo purposes, accept any username/password combination
  // In production, validate credentials against your user database
  if (username && password) {
    // Generate JWT token with user information
    const token = generateToken({
      id: 1,
      username: username,
      // Add other user claims as needed
    });

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: 1,
        username: username,
      },
    });
  } else {
    res.status(401).json({
      error: "Invalid credentials",
    });
  }
});

/**
 * GET /auth/profile
 * Protected route that returns user profile information
 * Requires valid JWT token
 */
router.get(
  "/profile",
  require("../middleware/auth").authenticateToken,
  (req, res) => {
    res.json({
      message: "Profile accessed successfully",
      user: req.user,
    });
  }
);

module.exports = router;
