import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export type UserStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface UserState {
  users: User[];
  status: UserStatus;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  status: 'idle',
  error: null,
};

interface UsersResponse {
  data?: {
    users?: User[];
  };
  users?: User[];
}

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    console.log('Fetching users...');
    const response = await api.get<UsersResponse>('/users');
    console.log('Raw API response:', response);
    
    // Handle different response structures
    const users = response.data?.data?.users || response.data?.users || response.data || [];
    console.log('Extracted users:', users);
    
    if (!Array.isArray(users)) {
      console.error('Unexpected users format:', users);
      return [];
    }
    
    return users;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
