import express from 'express';
import mongoose from 'mongoose';
import Collection from '../models/Collection.js';
import { CouponBook } from '../models/CouponBook.js';
import { protect, treasurerOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Record a collection
// @route   POST /api/collections
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { program, couponBook, amount, notes, markCompleted } = req.body;

    const book = await CouponBook.findById(couponBook).populate('bookType', 'program amountType fixedAmount leavesPerBook');
    if (!book) {
      return res.status(404).json({ message: 'Coupon book not found' });
    }

    const bookProgramStr = String(book.program?.toString?.() || book.program);
    const reqProgramStr = String(program);
    if (bookProgramStr !== reqProgramStr) {
      return res.status(400).json({ message: 'Book does not belong to this program' });
    }

    const isAssignedToUser = book.assignedTo.some(id => id.toString() === req.user._id.toString());
    if (!isAssignedToUser && req.user.role !== 'Treasurer') {
      return res.status(403).json({ message: 'Not authorized to record collection for this book' });
    }

    // Fixed amount cap only when book type belongs to same program
    const typeProgramStr = book.bookType?.program != null ? String(book.bookType.program.toString?.() || book.bookType.program) : null;
    if (book.bookType && typeProgramStr === bookProgramStr && book.bookType.amountType === 'Fixed') {
      const maxPossible = book.bookType.fixedAmount * book.bookType.leavesPerBook;
      if (book.collectionAmount + amount > maxPossible) {
        return res.status(400).json({ message: `Cannot exceed maximum book value of ₹${maxPossible}` });
      }
    }

    const collection = new Collection({
      program,
      couponBook,
      collectedBy: req.user._id,
      amount,
      notes
    });

    const savedCollection = await collection.save();

    // Update the book's total collection amount
    book.collectionAmount += amount;
    
    // Update status if needed
    if (markCompleted) {
      book.status = 'Completed';
      book.returnDate = Date.now();
    } else if (book.status === 'Assigned') {
      book.status = 'Returned'; // First return, pending completion
    }

    await book.save();

    res.status(201).json(savedCollection);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get collections for a program
// @route   GET /api/collections/program/:programId
// @access  Private (Treasurer)
router.get('/program/:programId', protect, treasurerOnly, async (req, res) => {
  try {
    const collections = await Collection.find({ program: req.params.programId })
      .populate('collectedBy', 'name phone')
      .populate('couponBook', 'bookNumber')
      .sort('-date');
      
    // Calculate totals
    const totalAmount = collections.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({ collections, totalAmount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete/Revert a collection record
// @route   DELETE /api/collections/:id
// @access  Private (Treasurer)
router.delete('/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const book = await CouponBook.findById(collection.couponBook);
    
    if (book) {
      // Revert the amount
      book.collectionAmount -= collection.amount;
      
      // If no money collected anymore, revert status back to 'Assigned'
      if (book.collectionAmount <= 0) {
        book.collectionAmount = 0;
        book.status = 'Assigned';
        book.returnDate = undefined;
      } else {
        book.status = 'Returned'; // It still has some collection logic left
      }
      await book.save();
    }

    await collection.deleteOne();
    res.json({ message: 'Collection record reverted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get aggregate stats for dashboard
// @route   GET /api/collections/stats
// @access  Private (Treasurer)
router.get('/stats', protect, treasurerOnly, async (req, res) => {
  try {
    // Basic stats for the dashboard
    const programsCount = await mongoose.model('Program').countDocuments();
    const membersCount = await mongoose.model('User').countDocuments();
    
    const books = await CouponBook.find({});
    const booksIssued = books.filter(b => b.status === 'Assigned' || b.status === 'Returned' || b.status === 'Completed').length;
    const booksReturned = books.filter(b => b.status === 'Returned' || b.status === 'Completed').length;
    
    const totalCollection = books.reduce((acc, curr) => acc + (curr.collectionAmount || 0), 0);
    
    res.json({
      totalPrograms: programsCount,
      totalMembers: membersCount,
      booksIssued,
      booksReturned,
      totalCollection
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
