import { createAsyncThunk, createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
} from './clientService';
import { RootState } from '../../store/store';

interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: ClientAddress;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  fullAddress?: string;
}

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

// Async thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      console.log('Fetching clients with token:', token.substring(0, 10) + '...');
      const response = await getClients(token);
      console.log('Clients API response:', response);
      
      // Handle different response formats
      let clients = [];
      if (Array.isArray(response)) {
        clients = response;
      } else if (response && response.data && Array.isArray(response.data.clients)) {
        clients = response.data.clients;
      } else if (response && response.data && Array.isArray(response.data)) {
        clients = response.data;
      } else if (response && Array.isArray(response.clients)) {
        clients = response.clients;
      } else {
        console.warn('Unexpected clients data format:', response);
        return [];
      }
      
      console.log('Processed clients:', clients);
      return clients;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const fetchClient = createAsyncThunk(
  'clients/fetchClient',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      const data = await getClient(id, token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client');
    }
  }
);

export const addClient = createAsyncThunk(
  'clients/addClient',
  async (clientData: Omit<Client, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      const data = await createClient(clientData, token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create client');
    }
  }
);

export const editClient = createAsyncThunk(
  'clients/editClient',
  async (
    { id, clientData }: { id: string; clientData: Partial<Omit<Client, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>> },
    { getState, rejectWithValue }
  ) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      const data = await updateClient(id, clientData, token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update client');
    }
  }
);

export const removeClient = createAsyncThunk(
  'clients/removeClient',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      await deleteClient(id, token);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete client');
    }
  }
);

export const searchClientsAction = createAsyncThunk(
  'clients/searchClients',
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const token = auth.token;
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      const data = await searchClients(query, token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search clients');
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearCurrentClient: (state: ClientState) => {
      state.currentClient = null;
    },
    clearSearchResults: (state: ClientState) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ClientState>) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle both response formats
        if (Array.isArray(action.payload)) {
          state.clients = action.payload;
        } else if (action.payload && action.payload.data && Array.isArray(action.payload.data.clients)) {
          state.clients = action.payload.data.clients;
        } else if (action.payload && Array.isArray(action.payload.clients)) {
          state.clients = action.payload.clients;
        } else {
          console.warn('Unexpected clients data format:', action.payload);
          state.clients = [];
        }
        console.log('Clients in Redux store:', state.clients);
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        console.error('Failed to fetch clients:', action.payload);
      })
      
      // Fetch Single Client
      .addCase(fetchClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClient.fulfilled, (state, action: PayloadAction<Client>) => {
        state.status = 'succeeded';
        state.currentClient = action.payload;
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Add Client
      .addCase(addClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addClient.fulfilled, (state, action: PayloadAction<Client>) => {
        state.status = 'succeeded';
        state.clients.push(action.payload);
      })
      .addCase(addClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Update Client
      .addCase(editClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(editClient.fulfilled, (state, action: PayloadAction<Client>) => {
        state.status = 'succeeded';
        const index = state.clients.findIndex(client => client._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient?._id === action.payload._id) {
          state.currentClient = action.payload;
        }
      })
      .addCase(editClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Delete Client
      .addCase(removeClient.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeClient.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.clients = state.clients.filter(client => client._id !== action.payload);
        if (state.currentClient?._id === action.payload) {
          state.currentClient = null;
        }
      })
      .addCase(removeClient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Search Clients
      .addCase(searchClientsAction.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchClientsAction.fulfilled, (state, action: PayloadAction<Client[]>) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchClientsAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentClient, clearSearchResults } = clientSlice.actions;

export const selectAllClients = (state: RootState) => state.clients.clients;
export const selectClientById = (state: RootState, clientId: string) =>
  state.clients.clients.find(client => client._id === clientId);
export const selectCurrentClient = (state: RootState) => state.clients.currentClient;
export const selectClientsStatus = (state: RootState) => state.clients.status;
export const selectClientsError = (state: RootState) => state.clients.error;
export const selectSearchResults = (state: RootState) => state.clients.searchResults;

export default clientSlice.reducer;
