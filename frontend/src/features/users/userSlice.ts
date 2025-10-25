import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import { RootState } from '../../store/store';

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

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState() as { auth: { user: any } };
    console.log('Fetching users - current user:', auth.user);
    console.log('Fetching users - current user role:', auth.user?.role);
    console.log('Fetching users - current user ID:', auth.user?._id);
    console.log('Fetching users - token exists:', !!localStorage.getItem('token'));

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
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const deleteUser = createAsyncThunk<string, string, { state: RootState; rejectValue: string }>(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Making DELETE request to:', `/users/${userId}`);
      console.log('API base URL:', api.defaults.baseURL);

      const response = await api.delete(`/users/${userId}`);
      console.log('DELETE request successful for user:', userId);
      console.log('Response status:', response.status);
      return userId;
    } catch (error: any) {
      console.error('DELETE request failed:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);

      // More detailed error extraction
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          return rejectWithValue(error.response.data);
        } else if (error.response.data.message) {
          return rejectWithValue(error.response.data.message);
        } else if (error.response.data.error) {
          return rejectWithValue(error.response.data.error);
        }
      }

      if (error.message) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue('Failed to delete user - unknown error');
    }
  }
);

export const selectAllUsers = (state: any) => state.users.users;
export const selectUsersStatus = (state: any) => state.users.status;
export const selectUsersError = (state: any) => state.users.error;

export default userSlice.reducer;
