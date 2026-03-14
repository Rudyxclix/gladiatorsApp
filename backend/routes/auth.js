import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, treasurerOnly } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gladiators_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Register a new user (Usually Treasurer creates them, but for initial setup keeping it as a route)
// @route   POST /api/auth/register
// @access  Private (Treasurer) or Public for first user setup
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, address } = req.body;

    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    const user = await User.create({
      name,
      phone,
      password,
      role: role || 'Executive', // Default role
      address,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all users (for assigning books)
// @route   GET /api/auth/users
// @access  Private (Treasurer)
router.get('/users', protect, treasurerOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
