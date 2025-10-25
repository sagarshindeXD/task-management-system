import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../features/auth/authSlice';

// Debug environment variables
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Force the correct API URL for production
const API_URL = 'https://task-management-system-rimh.onrender.com';
const baseURL = `${API_URL}/api`;

console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});
console.log('Using API base URL:', baseURL);

// For development, you can uncomment this to use localhost
// const baseURL = 'http://localhost:5000/api';
// console.log('Using LOCALHOST API URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Set default headers
delete api.defaults.headers.common['X-Requested-With'];
api.defaults.withCredentials = true;
api.defaults.headers.common['Cache-Control'] = 'no-cache';
api.defaults.headers.common['Pragma'] = 'no-cache';
api.defaults.headers.common['Expires'] = '0';

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.method?.toUpperCase(), config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios response error:', error);
    console.error('Error config:', error.config);
    console.error('Error response:', error.response);

    if (error.response?.status === 401) {
      // Check if this is a token expiration issue
      const token = localStorage.getItem('token');
      if (token) {
        console.warn('Received 401 response, token might be expired');

        // Only logout if we're not already in the process of logging out
        // This prevents infinite loops
        if (!error.config?.isRetry) {
          console.log('Logging out due to 401 response');
          store.dispatch(logout());

          // Show a user-friendly message
          if (typeof window !== 'undefined') {
            // Only show alert in browser environment
            setTimeout(() => {
              alert('Your session has expired. Please log in again.');
            }, 100);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
