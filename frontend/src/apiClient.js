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

// ── Request Interceptor ──
// Automatically attach JWT token from localStorage to every outgoing request.
// This ensures the token is always fresh from storage, even after the app
// has been minimized/backgrounded on mobile and resumed later.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──
// Globally handle 401 (Unauthorized) responses. Instead of letting the error
// crash the UI, we clear stale auth data and redirect to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect if we're not already on the login page
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');

        // Use window.location for a hard redirect to clear all React state
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
