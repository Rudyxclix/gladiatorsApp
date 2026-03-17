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

// @desc    Add sponsor to program
// @route   POST /api/programs/:id/sponsors
// @access  Private (Treasurer)
router.post('/:id/sponsors', protect, treasurerOnly, async (req, res) => {
  try {
    const { name, amount, date, description } = req.body;
    const program = await Program.findById(req.params.id);

    if (!name || isNaN(amount)) {
      return res.status(400).json({ message: 'Name and a valid amount are required' });
    }

    const sponsor = {
      name,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      description
    };

    program.sponsors.push(sponsor);
    program.totalSponsorship = (program.totalSponsorship || 0) + sponsor.amount;
    console.log(`Add sponsor: ${sponsor.name}, Amount: ${sponsor.amount}, New Total: ${program.totalSponsorship}`);

    const updatedProgram = await program.save();
    res.status(201).json(updatedProgram);
  } catch (error) {
    console.error('Error adding sponsor:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @desc    Remove sponsor from program
// @route   DELETE /api/programs/:id/sponsors/:sponsorId
// @access  Private (Treasurer)
router.delete('/:id/sponsors/:sponsorId', protect, treasurerOnly, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const sponsorIndex = program.sponsors.findIndex(s => s._id.toString() === req.params.sponsorId);
    if (sponsorIndex === -1) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    const sponsor = program.sponsors[sponsorIndex];
    program.totalSponsorship -= sponsor.amount;
    program.sponsors.splice(sponsorIndex, 1);

    const updatedProgram = await program.save();
    res.json(updatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update sponsor in program
// @route   PUT /api/programs/:id/sponsors/:sponsorId
// @access  Private (Treasurer)
router.put('/:id/sponsors/:sponsorId', protect, treasurerOnly, async (req, res) => {
  try {
    const { name, amount, date, description } = req.body;
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const sponsorIndex = program.sponsors.findIndex(s => s._id.toString() === req.params.sponsorId);
    if (sponsorIndex === -1) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    const oldAmount = program.sponsors[sponsorIndex].amount;
    const newAmount = Number(amount);

    program.sponsors[sponsorIndex].name = name || program.sponsors[sponsorIndex].name;
    program.sponsors[sponsorIndex].amount = newAmount;
    program.sponsors[sponsorIndex].date = date ? new Date(date) : program.sponsors[sponsorIndex].date;
    program.sponsors[sponsorIndex].description = description !== undefined ? description : program.sponsors[sponsorIndex].description;

    program.totalSponsorship = program.totalSponsorship - oldAmount + newAmount;

    const updatedProgram = await program.save();
    res.json(updatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add expense to program
// @route   POST /api/programs/:id/expenses
// @access  Private (Treasurer)
router.post('/:id/expenses', protect, treasurerOnly, async (req, res) => {
  try {
    const { description, amount, date, category } = req.body;
    const program = await Program.findById(req.params.id);
    if (!description || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Description and a valid amount are required' });
    }

    const expense = {
      description,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      category
    };

    program.expenses.push(expense);
    program.totalExpenses = (program.totalExpenses || 0) + expense.amount;
    console.log(`Add expense: ${expense.description}, Amount: ${expense.amount}, New Total: ${program.totalExpenses}`);

    const updatedProgram = await program.save();
    res.status(201).json(updatedProgram);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @desc    Remove expense from program
// @route   DELETE /api/programs/:id/expenses/:expenseId
// @access  Private (Treasurer)
router.delete('/:id/expenses/:expenseId', protect, treasurerOnly, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const expenseIndex = program.expenses.findIndex(e => e._id.toString() === req.params.expenseId);
    if (expenseIndex === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const expense = program.expenses[expenseIndex];
    program.totalExpenses -= expense.amount;
    program.expenses.splice(expenseIndex, 1);

    const updatedProgram = await program.save();
    res.json(updatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update expense in program
// @route   PUT /api/programs/:id/expenses/:expenseId
// @access  Private (Treasurer)
router.put('/:id/expenses/:expenseId', protect, treasurerOnly, async (req, res) => {
  try {
    const { description, amount, date, category } = req.body;
    const program = await Program.findById(req.params.id);
    if (!description || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Description and a valid amount are required' });
    }

    const expenseIndex = program.expenses.findIndex(e => e._id.toString() === req.params.expenseId);
    if (expenseIndex === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const oldAmount = program.expenses[expenseIndex].amount;
    const newAmount = Number(amount);

    program.expenses[expenseIndex].description = description || program.expenses[expenseIndex].description;
    program.expenses[expenseIndex].amount = newAmount;
    program.expenses[expenseIndex].date = date ? new Date(date) : program.expenses[expenseIndex].date;
    program.expenses[expenseIndex].category = category !== undefined ? category : program.expenses[expenseIndex].category;

    program.totalExpenses = program.totalExpenses - oldAmount + newAmount;

    const updatedProgram = await program.save();
    res.json(updatedProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Recalculate all program totals (Recovery/Sync)
// @route   GET /api/programs/:id/recalculate
// @access  Private (Treasurer)
router.get('/:id/recalculate', protect, treasurerOnly, async (req, res) => {
  try {
    const programId = req.params.id;
    const program = await Program.findById(programId);
    if (!program) return res.status(404).json({ message: 'Program not found' });

    // 1. Recalculate Book Collections
    const books = await CouponBook.find({ program: programId });
    const totalFromBooks = books.reduce((acc, b) => acc + (b.collectionAmount || 0), 0);

    // 2. Recalculate Sponsorships from the sub-documents array in the program itself
    const totalFromSponsors = program.sponsors.reduce((acc, s) => acc + (s.amount || 0), 0);

    // 3. Recalculate Expenses
    const totalExpenses = program.expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // Update the program document
    program.totalMoneyCollected = totalFromBooks;
    program.totalSponsorship = totalFromSponsors;
    program.totalExpenses = totalExpenses;

    const updatedProgram = await program.save();
    res.json(updatedProgram);
  } catch (error) {
    console.error('Recalculation error:', error);
    res.status(500).json({ message: 'Server error during recalculation' });
  }
});

export default router;
