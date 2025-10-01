import axios from 'axios';
import { API_BASE_URL } from '@config/constants';

const API_URL = `${API_BASE_URL}/clients`;

// Get all clients
export const getClients = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.clients;
};

// Get a single client
export const getClient = async (id: string, token: string) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.client;
};

// Create a new client
export const createClient = async (clientData: any, token: string) => {
  const response = await axios.post(API_URL, clientData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.client;
};

// Update a client
export const updateClient = async (id: string, clientData: any, token: string) => {
  const response = await axios.patch(`${API_URL}/${id}`, clientData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.client;
};

// Delete a client
export const deleteClient = async (id: string, token: string) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return id;
};

// Search clients
export const searchClients = async (query: string, token: string) => {
  const response = await axios.get(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.clients;
};
