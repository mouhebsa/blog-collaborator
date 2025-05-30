const User = require("../models/user");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password, roles } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
      roles: roles || ["Reader"],
    });

    await user.save();

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error during registration" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server Error during login" });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public (should ideally be protected or handled carefully)
const refreshToken = async (req, res) => {
  const { token: refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid refresh token: User not found" });
    }

    res.json({
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Refresh token expired" });
    }
    console.error(error);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  generateToken,
  generateRefreshToken,
};
