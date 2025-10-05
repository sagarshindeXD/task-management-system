// API Configuration
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_BASE_URL = baseUrl.endsWith('/') 
  ? `${baseUrl}api` 
  : baseUrl.endsWith('/api') 
    ? baseUrl 
    : `${baseUrl}/api`;
