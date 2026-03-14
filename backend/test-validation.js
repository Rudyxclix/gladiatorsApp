import mongoose from 'mongoose';
import { BookType } from './models/CouponBook.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const bookType = new BookType({
      program: '69b5b9a2e31297bc59fb591d',
      name: 'Test Fixed Coupon',
      leavesPerBook: '50',
      amountType: 'Fixed',
      fixedAmount: '50',
    });
    
    await bookType.validate();
    console.log("Validation passed");
    
    const createdType = await bookType.save();
    console.log("Saved successfully:", createdType._id);
    
    await BookType.findByIdAndDelete(createdType._id);
    
  } catch (error) {
    console.error("Validation failed:", error.message);
  }
  process.exit(0);
});
