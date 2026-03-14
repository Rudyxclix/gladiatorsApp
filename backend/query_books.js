import mongoose from 'mongoose';
import { CouponBook } from './models/CouponBook.js';

mongoose.connect('mongodb://127.0.0.1:27017/gladiators-club').then(async () => {
  const books = await CouponBook.find().populate('bookType').limit(5);
  console.log(JSON.stringify(books, null, 2));
  process.exit();
}).catch(console.error);
