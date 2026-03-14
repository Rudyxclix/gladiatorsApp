import express from 'express';
import Program from '../models/Program.js';
import { protect, treasurerOnly } from '../middleware/auth.js';
import mongoose from 'mongoose';
import { CouponBook } from '../models/CouponBook.js';

const router = express.Router();

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const programs = await Program.find({}).sort('-createdAt');
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a program
// @route   POST /api/programs
// @access  Private (Treasurer)
router.post('/', protect, treasurerOnly, async (req, res) => {
  try {
    const { name, description, date } = req.body;

    const program = new Program({
      name,
      description,
      date,
      createdBy: req.user._id,
    });

    const createdProgram = await program.save();
    res.status(201).json(createdProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a program
// @route   DELETE /api/programs/:id
// @access  Private (Treasurer)
router.delete('/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Check if any books are assigned, returned, or completed
    const activeBooks = await CouponBook.find({ 
      program: req.params.id, 
      status: { $ne: 'Available' } 
    });

    if (activeBooks.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete program. It has active or completed coupon books. Please mark the program as Completed instead.' 
      });
    }

    // Safe to delete. Also delete available inventory and types.
    await CouponBook.deleteMany({ program: req.params.id });
    await mongoose.model('BookType').deleteMany({ program: req.params.id });
    await program.deleteOne();

    res.json({ message: 'Program and its available inventory removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update program status
// @route   PUT /api/programs/:id/status
// @access  Private (Treasurer)
router.put('/:id/status', protect, treasurerOnly, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (program) {
      program.status = req.body.status || program.status;
      const updatedProgram = await program.save();
      res.json(updatedProgram);
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update program details
// @route   PUT /api/programs/:id
// @access  Private (Treasurer)
router.put('/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const { name, description, date } = req.body;
    const program = await Program.findById(req.params.id);

    if (program) {
      program.name = name || program.name;
      program.description = description !== undefined ? description : program.description;
      program.date = date || program.date;

      const updatedProgram = await program.save();
      res.json(updatedProgram);
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
