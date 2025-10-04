import { API_BASE_URL } from '@config/constants';

export interface Client {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

export const fetchClients = async (token: string): Promise<Client[]> => {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch clients');
  }
  
  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
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
