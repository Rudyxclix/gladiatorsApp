import mongoose from 'mongoose';

// Schema for different types of coupon books (e.g., Gift Coupon Book, Blank Coupon Book)
const bookTypeSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  leavesPerBook: {
    type: Number,
    required: true,
    min: 1,
  },
  amountType: {
    type: String,
    enum: ['Fixed', 'Custom'],
    required: true,
  },
  fixedAmount: {
    type: Number,
    // Only required if amountType is 'Fixed'
    required: function() {
      return this.amountType === 'Fixed';
    }
  }
}, { timestamps: true });

export const BookType = mongoose.model('BookType', bookTypeSchema);

// Schema for actual physical coupon books assigned to members
const couponBookSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  bookType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookType',
    required: true,
  },
  bookNumber: {
    type: String,
    required: true,
    trim: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['Available', 'In Progress', 'Partial', 'Returned', 'Completed'],
    default: 'Available',
  },
  issueDate: {
    type: Date,
  },
  returnDate: {
    type: Date,
  },
  collectionAmount: {
    type: Number,
    default: 0,
  },
  expectedAmount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Compound index to ensure book numbers are unique per program
couponBookSchema.index({ program: 1, bookNumber: 1 }, { unique: true });

// Performance indexes
couponBookSchema.index({ program: 1, status: 1 });
couponBookSchema.index({ assignedTo: 1 });

export const CouponBook = mongoose.model('CouponBook', couponBookSchema);
