// API configuration
export const API_BASE_URL = 'http://localhost:5000/api'; // Backend API URL

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
