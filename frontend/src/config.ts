// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

// API configuration
export const API_BASE_URL = isProduction
  ? 'https://your-production-api-url.com/api' // Replace with your production API URL
  : 'http://localhost:5000/api'; // Default to local development server

// Auth configuration
export const AUTH_CONFIG = {
  tokenKey: 'auth_token',
  userKey: 'user_data',
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Other app-wide configuration can go here
export default {
  API_BASE_URL,
  AUTH_CONFIG,
};
