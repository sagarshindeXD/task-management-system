// API Configuration
const baseUrl = process.env.REACT_APP_API_URL || 'https://task-management-system-rimh.onrender.com';
export const API_BASE_URL = baseUrl.endsWith('/')
  ? `${baseUrl}api`
  : baseUrl.endsWith('/api')
    ? baseUrl
    : `${baseUrl}/api`;
