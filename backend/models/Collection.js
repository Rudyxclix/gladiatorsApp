import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true,
  },
  couponBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CouponBook',
    required: true,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

collectionSchema.index({ program: 1, date: -1 });

export default mongoose.model('Collection', collectionSchema);
