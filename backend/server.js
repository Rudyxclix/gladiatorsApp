import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import programRoutes from './routes/programs.js';
import bookRoutes from './routes/books.js';
import collectionRoutes from './routes/collections.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/users', userRoutes);

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/gladiators';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connection successful');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gladiators Platform API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
