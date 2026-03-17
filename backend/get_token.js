import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const token = jwt.sign({ id: '65f0b5d9c2a6b23a2c918a4d', role: 'Executive' }, process.env.JWT_SECRET, { expiresIn: '1d' });
console.log(token);
