import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const CouponBook = mongoose.model('CouponBook', new mongoose.Schema({
    bookNumber: String, status: String, collectionAmount: Number, assignedTo: [mongoose.Schema.Types.ObjectId]
  }));
  const books = await CouponBook.find({}).limit(2).lean();
  console.log(JSON.stringify(books, null, 2));
  process.exit(0);
}
run();
