import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Client,
  fetchClients as fetchClientsService,
  createClient as createClientService,
  updateClient as updateClientService,
  deleteClient as deleteClientService,
  updateClientStatus as updateClientStatusService
} from '../../services/clientService';
import { RootState } from '../../store/store';

// Using Client interface from clientService

interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchResults: Client[];
}

const initialState: ClientState = {
  clients: [],
  currentClient: null,
  status: 'idle',
  error: null,
  searchResults: [],
};

// Helper function to get token
const getToken = (getState: () => unknown) => {
  const { auth } = getState() as RootState;
  return auth.token || localStorage.getItem('token');
};

// Async thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue('No authentication token found');
    
    try {
      const clients = await fetchClientsService(token);
      return clients.map((clientData: any) => {
        // Create a new client object with all required fields
        const client: Client = {
          ...clientData,
          name: clientData.name || 'Unnamed Client',
          createdBy: clientData.createdBy || 'unknown',
          updatedAt: clientData.updatedAt || new Date().toISOString(),
          isActive: clientData.isActive ?? true,
          // Ensure all required fields from BaseClient are present
          email: clientData.email,
          phone: clientData.phone,
          _id: clientData._id,
          // Extended fields
          address: clientData.address,
          fullAddress: clientData.fullAddress
        };
        return client;
      });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch clients');
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData: Omit<Client, '_id' | 'createdAt' | 'updatedAt'>, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue('No authentication token found');
    
    try {
      const newClient = await createClientService(clientData, token);
      return {
        ...newClient,
        createdBy: newClient.createdBy || 'unknown',
        updatedAt: newClient.updatedAt || new Date().toISOString(),
        isActive: newClient.isActive ?? true
      } as Client;
    } catch (error: any) {
      return rejectWithValue(error.message || error.response?.data?.message || 'Failed to create client');
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, clientData }: { id: string; clientData: Partial<Client> }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue('No authentication token found');
    
    try {
      const updatedClient = await updateClientService(id, clientData, token);
      return {
        ...updatedClient,
        updatedAt: updatedClient.updatedAt || new Date().toISOString()
      } as Client;
    } catch (error: any) {
      return rejectWithValue(error.message || error.response?.data?.message || 'Failed to update client');
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue('No authentication token found');
    
    try {
      await deleteClientService(id, token);
      return id;
    } catch (error: any) {
      console.log('Redux deleteClient error:', error);
      return rejectWithValue(error.message || error.response?.data?.message || 'Failed to delete client');
    }
  }
);

export const updateClientStatus = createAsyncThunk(
  'clients/updateClientStatus',
  async ({ id, isActive }: { id: string; isActive: boolean }, { getState, rejectWithValue }) => {
    const token = getToken(getState);
    if (!token) return rejectWithValue('No authentication token found');

    try {
      const updatedClient = await updateClientStatusService(id, isActive, token);
      return {
        ...updatedClient,
        updatedAt: updatedClient.updatedAt || new Date().toISOString()
      } as Client;
    } catch (error: any) {
      return rejectWithValue(error.message || error.response?.data?.message || 'Failed to update client status');
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setCurrentClient: (state, action: PayloadAction<Client | null>) => {
      state.currentClient = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Clients
    builder.addCase(fetchClients.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchClients.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.clients = action.payload;
    });
    builder.addCase(fetchClients.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Create Client
    builder.addCase(createClient.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(createClient.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.clients.push(action.payload);
    });
    builder.addCase(createClient.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Update Client
    builder.addCase(updateClient.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(updateClient.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const index = state.clients.findIndex(client => client._id === action.payload._id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
      if (state.currentClient?._id === action.payload._id) {
        state.currentClient = action.payload;
      }
    });
    builder.addCase(updateClient.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Delete Client
    builder.addCase(deleteClient.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(deleteClient.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.clients = state.clients.filter(client => client._id !== action.payload);
      if (state.currentClient?._id === action.payload) {
        state.currentClient = null;
      }
    });
    builder.addCase(deleteClient.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Update Client Status
    builder.addCase(updateClientStatus.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(updateClientStatus.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const index = state.clients.findIndex(client => client._id === action.payload._id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
      if (state.currentClient?._id === action.payload._id) {
        state.currentClient = action.payload;
      }
    });
    builder.addCase(updateClientStatus.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentClient, clearSearchResults, setCurrentClient } = clientSlice.actions;

export const selectAllClients = (state: RootState) => state.clients.clients;
export const selectClientById = (state: RootState, clientId: string) =>
  state.clients.clients.find(client => client._id === clientId);
export const selectCurrentClient = (state: RootState) => state.clients.currentClient;
export const selectClientsStatus = (state: RootState) => state.clients.status;
export const selectClientsError = (state: RootState) => state.clients.error;
export const selectSearchResults = (state: RootState) => state.clients.searchResults;
export default clientSlice.reducer;
