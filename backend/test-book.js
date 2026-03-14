import mongoose from 'mongoose';
import { BookType } from './models/CouponBook.js';
import Program from './models/Program.js';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

const testBookType = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const program = await Program.findOne();
    console.log('Using program:', program._id);

    const bookType = new BookType({
      program: program._id,
      name: 'Test Custom',
      leavesPerBook: 20,
      amountType: 'Custom',
      fixedAmount: undefined,
    });

    await bookType.save();
    console.log('Success!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testBookType();
