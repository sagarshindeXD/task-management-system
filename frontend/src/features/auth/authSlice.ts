import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store/store';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users`;

// Response types
interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

interface ErrorResponse {
  message: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  createdAt?: string;  // Make it optional with ? in case it's not always present
}

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

export const register = createAsyncThunk<
  AuthResponse,
  RegisterCredentials,
  { rejectValue: string }
>(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
        name,
        email,
        password,
        passwordConfirm: password,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const login = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue(message) as any; // Type assertion needed for Redux Toolkit's typing
    }
  }
);

// Define the API response type
interface MeResponse {
  status: string;
  data: {
    user: User;
  };
}

export const getMe = createAsyncThunk<User, void, { state: RootState; rejectValue: string }>(
  'auth/getMe',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.token) {
        console.error('No authentication token found');
        return rejectWithValue('No authentication token found');
      }
      
      console.log('Making request to /me endpoint with token:', auth.token);
      const response = await axios.get<MeResponse>(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      console.log('Raw response from /me:', response.data);
      
      // Extract user data from the response
      const userData = response.data.data?.user;
      
      if (!userData) {
        console.error('No user data in response:', response.data);
        return rejectWithValue('No user data in response');
      }
      
      console.log('Successfully fetched user data:', userData);
      return userData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user';
      console.error('Error in getMe:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && 'user' in action.payload) {
          state.user = action.payload.user;
        }
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload; // payload is the user object directly
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    { name, email }: { name: string; email: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const { token } = (getState() as RootState).auth;
      const response = await axios.patch<{ user: User }>(
        `${API_URL}/me`,
        { name, email },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const { token } = (getState() as RootState).auth;
      await axios.patch(
        `${API_URL}/update-password`,
        { currentPassword, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      );
    }
  }
);

export const { logout, clearError } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
