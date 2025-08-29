const express = require("express");
const router = express.Router();
const {
  createUser,
  getUser,
  getAllUsers,
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

// Public route - no authentication required
router.post("/", createUser);

// Protected routes - authentication required
router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUser);

module.exports = router;
