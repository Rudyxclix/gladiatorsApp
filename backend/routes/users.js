import express from 'express';
import User from '../models/User.js';
import { CouponBook } from '../models/CouponBook.js';
import Collection from '../models/Collection.js';
import { protect, treasurerOnly } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// @desc    Get all members
// @route   GET /api/users
// @access  Private (Treasurer)
router.get('/', protect, treasurerOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Create a new member
// @route   POST /api/users
// @access  Private (Treasurer)
router.post('/', protect, treasurerOnly, async (req, res) => {
  try {
    const { name, phone, password, role, address, isGroup } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone already exists' });
    }

    const user = new User({
      name,
      phone,
      password,
      role: role || 'Member',
      address,
    });

    const createdUser = await user.save();
    res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      phone: createdUser.phone,
      role: createdUser.role,
      isActive: createdUser.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update a member
// @route   PUT /api/users/:id
// @access  Private (Treasurer)
router.put('/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (req.body.phone && req.body.phone !== user.phone) {
        const phoneExists = await User.findOne({ phone: req.body.phone });
        if (phoneExists) {
            return res.status(400).json({ message: 'Phone number already in use' });
        }
      }

      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.role = req.body.role || user.role;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      
      if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
      }

      if (req.body.password) {
        user.password = req.body.password; // pre-save hook will hash it
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        address: updatedUser.address
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete or soft-delete a member
// @route   DELETE /api/users/:id
// @access  Private (Treasurer)
router.delete('/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for active assigned books
    const activeBooks = await CouponBook.find({ 
      assignedTo: user._id, 
      status: { $in: ['Assigned', 'Returned'] } 
    });

    if (activeBooks.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete member with active coupon books. Please mark them as completed or reassign the books first.' 
      });
    }

    // Check if they have ANY books (Completed) or collections
    const anyBooks = await CouponBook.findOne({ assignedTo: user._id });
    const anyCollections = await Collection.findOne({ collectedBy: user._id });

    if (anyBooks || anyCollections) {
      // Soft delete
      user.isActive = false;
      await user.save();
      return res.json({ message: 'Member has historical records. Safely deactivated instead of deleted.', deactivated: true });
    } else {
      // Hard delete
      await user.deleteOne();
      return res.json({ message: 'Member deleted successfully', deleted: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
