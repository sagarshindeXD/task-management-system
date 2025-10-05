import { API_BASE_URL } from '../config';

export interface Client {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  createdBy?: string;
  fullAddress?: string;
}

export const fetchClients = async (token: string): Promise<Client[]> => {
  try {
    console.log('Fetching clients from:', `${API_BASE_URL}/clients`);
    console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('Authentication failed - redirecting to login');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return [];
    }
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (!response.ok) {
      try {
        const error = responseText ? JSON.parse(responseText) : {};
        console.error('Error response:', error);
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        throw new Error(`Failed to fetch clients. Status: ${response.status}`);
      }
    }
    
    const data = responseText ? JSON.parse(responseText) : {};
    console.log('Parsed response data:', data);
    
    // Handle different possible response formats
    if (data && data.data && Array.isArray(data.data)) {
      console.log('Found clients in data.data:', data.data);
      return data.data;
    } else if (data && data.data && data.data.clients && Array.isArray(data.data.clients)) {
      console.log('Found clients in data.data.clients:', data.data.clients);
      return data.data.clients;
    } else if (Array.isArray(data)) {
      console.log('Response is already an array:', data);
      return data;
    } else if (data && Array.isArray(data.clients)) {
      console.log('Found clients in data.clients:', data.clients);
      return data.clients;
    }
    console.warn('Unexpected response format, returning empty array');
    return [];
  } catch (error) {
    console.error('Error in fetchClients:', error);
    if (error instanceof Error && error.message.includes('401')) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return [];
  }
};

export const createClient = async (clientData: Omit<Client, '_id'>, token: string): Promise<Client> => {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create client');
  }
  
  return response.json();
};

export const updateClient = async (id: string, clientData: Partial<Client>, token: string): Promise<Client> => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update client');
  }
  
  return response.json();
};

export const deleteClient = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete client');
  }
};

export const updateClientStatus = async (id: string, isActive: boolean, token: string): Promise<Client> => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update client status');
  }
  
  return response.json();
};
