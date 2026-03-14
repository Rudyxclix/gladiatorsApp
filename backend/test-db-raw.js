import mongoose from 'mongoose';
import { CouponBook } from './models/CouponBook.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const books = await CouponBook.find().limit(2).lean();
  console.log("Raw books (no populate):");
  console.log(JSON.stringify(books, null, 2));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
