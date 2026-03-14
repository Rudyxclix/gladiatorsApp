/**
 * Test script: verifies GET inventory normalization (book type program mismatch).
 * Run from backend: node test-inventory-normalize.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from './models/Program.js';
import { BookType, CouponBook } from './models/CouponBook.js';

dotenv.config();

function toProgramId(val) {
  if (val == null) return null;
  return String(typeof val === 'object' && val.toString ? val.toString() : val);
}

function normalizeBookTypeToProgram(bookDoc, programIdStr) {
  const book = bookDoc.toObject ? bookDoc.toObject() : { ...bookDoc };
  const typeProgramId = book.bookType?.program != null ? toProgramId(book.bookType.program) : null;
  const requestProgramId = programIdStr ? toProgramId(programIdStr) : null;
  const typeBelongsToRequestProgram = requestProgramId && typeProgramId && requestProgramId === typeProgramId;
  if (book.bookType && !typeBelongsToRequestProgram) {
    book.typeMismatch = true;
    book.bookType = null;
  }
  return book;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gladiators');
    console.log('Connected to MongoDB\n');

    const programs = await mongoose.model('Program').find().limit(2).lean();
    if (programs.length === 0) {
      console.log('No programs found. Create programs first.');
      process.exit(1);
    }

    const programId = programs[0]._id;
    const programIdStr = toProgramId(programId);
    console.log('Testing with program:', programs[0].name, '| id:', programIdStr);

    const types = await BookType.find({ program: programId }).lean();
    console.log('Book types for this program:', types.length);
    types.forEach((t) => console.log('  -', t.name, '| type.program:', toProgramId(t.program)));

    const books = await CouponBook.find({ program: programId })
      .populate('bookType', 'program name leavesPerBook amountType fixedAmount')
      .sort('bookNumber')
      .limit(5);

    console.log('\nBooks in program:', books.length);
    for (const b of books) {
      const rawProgramId = b.program != null ? toProgramId(b.program) : null;
      const rawTypeProgramId = b.bookType?.program != null ? toProgramId(b.bookType.program) : null;
      const normalized = normalizeBookTypeToProgram(b, programIdStr);
      const match = rawProgramId === rawTypeProgramId;
      const requestMatch = programIdStr === rawTypeProgramId;
      console.log('  Book #' + b.bookNumber + ':');
      console.log('    book.program (raw):     ', rawProgramId);
      console.log('    type.program (raw):     ', rawTypeProgramId);
      console.log('    request programIdStr:  ', programIdStr);
      console.log('    type matches book?     ', match);
      console.log('    type matches request?  ', requestMatch);
      console.log('    after normalize:       bookType=', normalized.bookType ? normalized.bookType.name : 'null', 'typeMismatch=', normalized.typeMismatch ?? false);
    }

    console.log('\nDone.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
