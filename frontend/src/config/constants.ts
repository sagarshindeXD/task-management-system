// API Configuration
const baseUrl = 'https://task-management-system-rimh.onrender.com';
export const API_BASE_URL = baseUrl.endsWith('/')
  ? `${baseUrl}api`
  : baseUrl.endsWith('/api')
    ? baseUrl
    : `${baseUrl}/api`;
