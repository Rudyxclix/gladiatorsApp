import axios from 'axios';

// Base URL for API calls.
// Set VITE_API_BASE_URL in your .env file for production (e.g. https://gladiators-backend.onrender.com/api).
// Defaults to localhost for local development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
