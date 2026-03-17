import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from './models/Program.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/gladiators';

async function listPrograms() {
  try {
    await mongoose.connect(mongoURI);
    const programs = await Program.find({});
    console.log(JSON.stringify(programs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listPrograms();
