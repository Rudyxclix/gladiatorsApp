import mongoose from 'mongoose';
import { CouponBook, BookType } from './models/CouponBook.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const books = await CouponBook.find().populate('bookType').limit(2);
  console.log("Raw books with populated bookType:");
  console.log(JSON.stringify(books, null, 2));
  
  const types = await BookType.find().limit(2);
  console.log("\nSample Book Types:");
  console.log(JSON.stringify(types, null, 2));

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
