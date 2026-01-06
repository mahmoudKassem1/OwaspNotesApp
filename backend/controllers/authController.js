const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name: username,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: true,      // <--- ADDED: Must match the login cookie to delete it
    sameSite: 'None',  // <--- ADDED: Must match the login cookie to delete it
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Verify user password
// @route   POST /api/auth/verify-password
// @access  Private
const verifyPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
  
    if (!password) {
      res.status(400);
      throw new Error('Password is required');
    }
  
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({ message: 'Password verified successfully' });
    } else {
      res.status(401);
      throw new Error('Invalid password');
    }
});

// Helper Function
const generateToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  
    res.cookie('token', token, {
      httpOnly: true,
      // CRITICAL CHANGES FOR VERCEL DEPLOYMENT:
      secure: true,       // Must be true for sameSite: 'None'
      sameSite: 'None',   // Allows cookie to travel from Render -> Vercel
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  verifyPassword,
};