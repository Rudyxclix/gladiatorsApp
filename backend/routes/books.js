import express from 'express';
import mongoose from 'mongoose';
import { BookType, CouponBook } from '../models/CouponBook.js';
import { protect, treasurerOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all books assigned to current user (Member/Executive) Across all programs
// @route   GET /api/books/my-books
// @access  Private
router.get('/my-books', protect, async (req, res) => {
  try {
    const books = await CouponBook.find({ 
      assignedTo: { $in: [req.user._id] } 
    })
    .populate('program', 'name status')
    .populate('bookType', 'name fixedAmount amountType leavesPerBook')
    .sort('-updatedAt');
    
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/** Normalize program ID for consistent comparison (ObjectId or string → string). */
function toProgramId(val) {
  if (val == null) return null;
  return String(typeof val === 'object' && val.toString ? val.toString() : val);
}

/** Ensure book's type belongs to the same program; return book as plain object with type nullified if not. */
function normalizeBookTypeToProgram(bookDoc, programIdStr) {
  const book = bookDoc.toObject ? bookDoc.toObject() : { ...bookDoc };
  // Compare type's program to the REQUEST program (not book.program) to avoid serialization mismatches
  const typeProgramId = book.bookType?.program != null ? toProgramId(book.bookType.program) : null;
  const requestProgramId = programIdStr ? toProgramId(programIdStr) : null;
  const typeBelongsToRequestProgram = requestProgramId && typeProgramId && requestProgramId === typeProgramId;
  if (book.bookType && !typeBelongsToRequestProgram) {
    book.typeMismatch = true;
    book.bookType = null;
  }
  return book;
}

/** Auto-fix: update books in this program that have another program's type to this program's first type. Returns count updated. */
async function applyFixMismatchedTypesForProgram(programId) {
  const programObjId = mongoose.Types.ObjectId.isValid(programId) ? new mongoose.Types.ObjectId(programId) : programId;
  const typesForProgram = await BookType.find({ program: programObjId }).sort({ createdAt: 1 });
  if (typesForProgram.length === 0) return 0;
  const targetTypeId = typesForProgram[0]._id;
  const typesFromOtherPrograms = await BookType.find({ program: { $ne: programObjId } }).select('_id');
  const otherTypeIds = typesFromOtherPrograms.map(t => t._id);
  if (otherTypeIds.length === 0) return 0;
  const result = await CouponBook.updateMany(
    { program: programObjId, bookType: { $in: otherTypeIds } },
    { $set: { bookType: targetTypeId } }
  );
  return result.modifiedCount ?? 0;
}

// @desc    Get all book types for a program
// @route   GET /api/books/types/:programId
// @access  Private
router.get('/types/:programId', protect, async (req, res) => {
  try {
    const types = await BookType.find({ program: req.params.programId });
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a book type
// @route   POST /api/books/types
// @access  Private (Treasurer)
router.post('/types', protect, treasurerOnly, async (req, res) => {
  try {
    const { program, name, leavesPerBook, amountType, fixedAmount } = req.body;
    if (!program) {
      return res.status(400).json({ message: 'Program is required' });
    }

    const bookType = new BookType({
      program,
      name,
      leavesPerBook,
      amountType,
      fixedAmount: amountType === 'Fixed' ? fixedAmount : undefined,
    });

    const createdType = await bookType.save();
    res.status(201).json(createdType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update a book type (program-scoped when programId provided)
// @route   PUT /api/books/types/:id
// @access  Private (Treasurer)
router.put('/types/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const { name, leavesPerBook, amountType, fixedAmount, programId } = req.body;
    const bookType = await BookType.findById(req.params.id);

    if (bookType) {
      if (programId && toProgramId(bookType.program) !== toProgramId(programId)) {
        return res.status(403).json({ message: 'Book type does not belong to this program' });
      }
      bookType.name = name || bookType.name;
      bookType.leavesPerBook = leavesPerBook || bookType.leavesPerBook;
      
      // If we are changing amount type, handled here
      if (amountType) {
        bookType.amountType = amountType;
        bookType.fixedAmount = amountType === 'Fixed' ? (fixedAmount || bookType.fixedAmount) : undefined;
      } else if (bookType.amountType === 'Fixed' && fixedAmount !== undefined) {
        bookType.fixedAmount = fixedAmount;
      }

      const updatedType = await bookType.save();
      res.json(updatedType);
    } else {
      res.status(404).json({ message: 'Book type not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete a book type (program-scoped: type must belong to given program)
// @route   DELETE /api/books/types/:id
// @access  Private (Treasurer)
router.delete('/types/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const programId = req.query.programId || req.body.programId;
    const type = await BookType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Book type not found' });
    }
    if (programId && toProgramId(type.program) !== toProgramId(programId)) {
      return res.status(403).json({ message: 'Book type does not belong to this program' });
    }

    const associatedBooks = await CouponBook.find({ bookType: req.params.id });
    if (associatedBooks.length > 0) {
      return res.status(400).json({ message: 'Cannot delete book type that has generated books.' });
    }

    await type.deleteOne();
    res.json({ message: 'Book type removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Generate/Add physical coupon books
// @route   POST /api/books/inventory
// @access  Private (Treasurer)
router.post('/inventory', protect, treasurerOnly, async (req, res) => {
  try {
    const { program, bookType, startNumber, count } = req.body;

    // Ensure book type belongs to this program (program-specific book types)
    const typeDoc = await BookType.findById(bookType);
    if (!typeDoc) {
      return res.status(400).json({ message: 'Book type not found' });
    }
    if (toProgramId(typeDoc.program) !== toProgramId(program)) {
      return res.status(400).json({ message: 'Book type does not belong to this program' });
    }

    const books = [];
    for (let i = 0; i < count; i++) {
      const expectedAmount = typeDoc.amountType === 'Fixed' ? typeDoc.fixedAmount * typeDoc.leavesPerBook : 0;
      books.push({
        program,
        bookType,
        bookNumber: `${startNumber + i}`,
        status: 'Available',
        expectedAmount
      });
    }

    const createdBooks = await CouponBook.insertMany(books);
    res.status(201).json({ message: `${createdBooks.length} books added successfully` });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'One or more book numbers already exist for this program' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update a specific coupon book (bookNumber only; program-scoped)
// @route   PUT /api/books/inventory/:id
// @access  Private (Treasurer)
router.put('/inventory/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const programId = req.body.programId || req.query.programId;
    const book = await CouponBook.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (programId && toProgramId(book.program) !== toProgramId(programId)) {
      return res.status(403).json({ message: 'Book does not belong to this program' });
    }
    if (req.body.bookNumber != null) {
      book.bookNumber = req.body.bookNumber;
    }
    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This book number already exists.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a book's type (fix wrong-program type; new type must belong to book's program)
// @route   PUT /api/books/inventory/:id/book-type
// @access  Private (Treasurer)
router.put('/inventory/:id/book-type', protect, treasurerOnly, async (req, res) => {
  try {
    const { bookType: newTypeId, programId } = req.body;
    if (!newTypeId) {
      return res.status(400).json({ message: 'Book type is required' });
    }
    const book = await CouponBook.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (programId && toProgramId(book.program) !== toProgramId(programId)) {
      return res.status(403).json({ message: 'Book does not belong to this program' });
    }
    const typeDoc = await BookType.findById(newTypeId);
    if (!typeDoc) {
      return res.status(400).json({ message: 'Book type not found' });
    }
    if (toProgramId(typeDoc.program) !== toProgramId(book.program)) {
      return res.status(400).json({ message: 'Book type must belong to the same program as the book' });
    }
    book.bookType = newTypeId;
    book.expectedAmount = typeDoc.amountType === 'Fixed' ? typeDoc.fixedAmount * typeDoc.leavesPerBook : 0;
    const updatedBook = await book.save();
    const populated = await CouponBook.findById(updatedBook._id)
      .populate('bookType', 'program name leavesPerBook amountType fixedAmount')
      .populate('assignedTo', 'name phone');
    const normalized = normalizeBookTypeToProgram(populated, toProgramId(book.program));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete a specific coupon book (program-scoped)
// @route   DELETE /api/books/inventory/:id
// @access  Private (Treasurer)
router.delete('/inventory/:id', protect, treasurerOnly, async (req, res) => {
  try {
    const programId = req.body.programId || req.query.programId;
    const book = await CouponBook.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (programId && toProgramId(book.program) !== toProgramId(programId)) {
      return res.status(403).json({ message: 'Book does not belong to this program' });
    }

    if (book.status !== 'Available') {
      return res.status(400).json({ message: 'Cannot delete a book that is assigned, returned, or completed.' });
    }

    await book.deleteOne();
    res.json({ message: 'Book removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Bulk fix mismatched book types: set all books in program that have another program's type to the given (or first) type of this program
// @route   POST /api/books/inventory/fix-mismatched-types
// @access  Private (Treasurer)
router.post('/inventory/fix-mismatched-types', protect, treasurerOnly, async (req, res) => {
  try {
    const { programId, bookTypeId } = req.body;
    if (!programId) {
      return res.status(400).json({ message: 'Program context (programId) is required' });
    }
    const programObjId = mongoose.Types.ObjectId.isValid(programId) ? new mongoose.Types.ObjectId(programId) : programId;

    const typesForProgram = await BookType.find({ program: programObjId }).sort({ createdAt: 1 });
    if (typesForProgram.length === 0) {
      return res.status(400).json({ message: 'This program has no book types. Add a type first.' });
    }
    const targetTypeId = bookTypeId && typesForProgram.some(t => toProgramId(t._id) === toProgramId(bookTypeId))
      ? (mongoose.Types.ObjectId.isValid(bookTypeId) ? new mongoose.Types.ObjectId(bookTypeId) : bookTypeId)
      : typesForProgram[0]._id;

    const typesFromOtherPrograms = await BookType.find({ program: { $ne: programObjId } }).select('_id');
    const otherTypeIds = typesFromOtherPrograms.map(t => t._id);
    if (otherTypeIds.length === 0) {
      return res.json({ message: 'No mismatched types to fix', updatedCount: 0 });
    }

    const result = await CouponBook.updateMany(
      { program: programObjId, bookType: { $in: otherTypeIds } },
      { $set: { bookType: targetTypeId } }
    );

    res.json({ message: `Updated ${result.modifiedCount} book(s) to the correct type`, updatedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Bulk delete specific coupon books (program-scoped: only deletes books in the given program)
// @route   POST /api/books/inventory/bulk-delete
// @access  Private (Treasurer)
router.post('/inventory/bulk-delete', protect, treasurerOnly, async (req, res) => {
  try {
    const { bookIds, programId } = req.body;

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: 'No books provided for deletion' });
    }
    if (!programId) {
      return res.status(400).json({ message: 'Program context (programId) is required for bulk delete' });
    }

    const result = await CouponBook.deleteMany({
      _id: { $in: bookIds },
      program: programId,
      status: 'Available'
    });

    res.json({ message: `Successfully removed ${result.deletedCount} books`, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get inventory (books) for a program. Note: Pagination added for performance.
// @route   GET /api/books/inventory/:programId
// @access  Private
router.get('/inventory/:programId', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    let filter = { program: req.params.programId };
    if (req.user.role === 'Executive' || req.user.role === 'Member') {
      // Explicitly check if the user's ID exists anywhere in the assignedTo array
      filter.assignedTo = { $in: [req.user._id] };
    }

    const totalBooks = await CouponBook.countDocuments(filter);

    let books = await CouponBook.find(filter)
      .populate('bookType', 'program name leavesPerBook amountType fixedAmount')
      .populate('assignedTo', 'name phone')
      .collation({ locale: 'en_US', numericOrdering: true })
      .sort('bookNumber')
      .skip(skip)
      .limit(limit)
      .lean(); // Return plain JS objects to save memory

    const programIdStr = toProgramId(req.params.programId) || String(req.params.programId);
    let normalized = books.map((b) => normalizeBookTypeToProgram(b, programIdStr));

    res.json({
      books: normalized,
      totalCount: totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Assign book to a member or group of members (program-scoped)
// @route   PUT /api/books/:id/assign
// @access  Private (Treasurer)
router.put('/:id/assign', protect, treasurerOnly, async (req, res) => {
  try {
    const { assignedTo, programId } = req.body;
    if (!programId) {
      return res.status(400).json({ message: 'Program context (programId) is required' });
    }
    const ids = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

    const book = await CouponBook.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (toProgramId(book.program) !== toProgramId(programId)) {
      return res.status(403).json({ message: 'Book does not belong to this program' });
    }
    if (book.status !== 'Available') {
      return res.status(400).json({ message: 'Book is not available for assignment' });
    }

    book.assignedTo = ids;
    book.status = 'In Progress';
    book.issueDate = Date.now();
    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Unassign a book (Revert to Available)
// @route   PUT /api/books/inventory/:id/unassign
// @access  Private (Treasurer)
router.put('/inventory/:id/unassign', protect, treasurerOnly, async (req, res) => {
  try {
    const programId = req.body.programId || req.query.programId;
    const book = await CouponBook.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (programId && toProgramId(book.program) !== toProgramId(programId)) {
      return res.status(403).json({ message: 'Book does not belong to this program' });
    }

    if (book.collectionAmount > 0) {
      return res.status(400).json({ message: 'Cannot unassign a book that has recorded collections. Please revert collections first.' });
    }

    book.status = 'Available';
    book.assignedTo = [];
    book.issueDate = undefined;
    book.returnDate = undefined;
    book.collectionAmount = 0;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Force edit an active assignment (Members, Amount, Status)
// @route   PUT /api/books/inventory/:id/assignment/edit
// @access  Private (Treasurer)
router.put('/inventory/:id/assignment/edit', protect, treasurerOnly, async (req, res) => {
  try {
    const { assignedTo, collectionAmount, status, programId } = req.body;
    if (!programId) {
      return res.status(400).json({ message: 'Program context (programId) is required' });
    }

    const book = await CouponBook.findById(req.params.id).populate('bookType', 'program amountType fixedAmount leavesPerBook');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (toProgramId(book.program) !== toProgramId(programId)) {
      return res.status(403).json({ message: 'Book does not belong to this program' });
    }

    const ids = assignedTo != null ? (Array.isArray(assignedTo) ? assignedTo : [assignedTo]) : undefined;
    if (ids !== undefined) book.assignedTo = ids;

    let amountDiff = 0;
    if (collectionAmount !== undefined) {
      const typeSameProgram = book.bookType && toProgramId(book.bookType.program) === toProgramId(book.program);
      const newAmount = parseFloat(collectionAmount);
      if (typeSameProgram && book.bookType.amountType === 'Fixed') {
        const maxPossible = book.bookType.fixedAmount * book.bookType.leavesPerBook;
        if (newAmount > maxPossible) {
          return res.status(400).json({ message: `Cannot exceed maximum book value of ₹${maxPossible}` });
        }
      }
      amountDiff = newAmount - book.collectionAmount;
      book.collectionAmount = newAmount;
    }

    if (status !== undefined) book.status = status;
    if (status === 'Completed' && !book.returnDate) {
      book.returnDate = Date.now();
    }

    const updatedBook = await book.save();
    
    // Update program total if collection amount changed
    if (amountDiff !== 0) {
      await mongoose.model('Program').findByIdAndUpdate(programId, { 
        $inc: { totalMoneyCollected: amountDiff } 
      });
    }
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
