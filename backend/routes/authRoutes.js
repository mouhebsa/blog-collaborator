const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshToken,
} = require("../controllers/authController");

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   POST /api/auth/refresh-token
router.post("/refresh-token", refreshToken);

module.exports = router;
