import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import api from '../../utils/axios'; // Import the configured axios instance

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
  users: User[];
  token: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  users: [],
  token: localStorage.getItem('token'),
  isAuthenticated: false, // Start with false, will be set to true after successful validation
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
      console.log('Making register request to register endpoint');
      const response = await api.post<AuthResponse>('/users/register', {
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
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    const startTime = performance.now();
    try {
      console.log('Making login request to login endpoint');
      // Make the login request - this returns all the user data we need
      const loginResponse = await api.post<AuthResponse>('/users/login', {
        email,
        password,
      });

      // The backend returns { status: 'success', token, data: { user } }
      // But our interface expects { user, token, message? }
      // We need to transform the response to match our interface
      const rawResponse = loginResponse.data as any;
      const transformedResponse: AuthResponse = {
        user: rawResponse.data?.user,
        token: rawResponse.token,
        message: rawResponse.status === 'success' ? 'Login successful' : undefined
      };

      if (transformedResponse.token) {
        localStorage.setItem('token', transformedResponse.token);
        // Set token expiration time (24 hours from now)
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiration', expirationTime.toString());
      }

      const endTime = performance.now();
      console.log(`Login completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log('Login successful, user data:', transformedResponse.user);

      return transformedResponse;
    } catch (error: any) {
      const endTime = performance.now();
      console.error(`Login failed after ${(endTime - startTime).toFixed(2)}ms:`, error.message);
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue(message) as any;
    }
  }
);

// Define the API response type for /users/me endpoint
interface MeApiResponse {
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
      
      console.log('Making request to /users/me endpoint with token:', auth.token);
      const response = await api.get<MeApiResponse>('/users/me');
      
      console.log('Raw response from /users/me:', response.data);
      
      // Extract user data from the response
      const userData = response.data?.data?.user;
      
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
      localStorage.removeItem('tokenExpiration');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Check if token is expired
    checkTokenExpiration: (state) => {
      const token = localStorage.getItem('token');
      const expirationTime = localStorage.getItem('tokenExpiration');

      if (token && expirationTime) {
        const now = Date.now();
        const expiration = parseInt(expirationTime);

        if (now > expiration) {
          // Token is expired, clear everything
          console.log('Token expired, clearing authentication state');
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = 'Session expired. Please log in again.';
        }
      } else if (token && !expirationTime) {
        // Token exists but no expiration time, might be from old session
        // For now, we'll keep it but this could be improved
        console.log('Token exists but no expiration time found');
      }
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
        // Token is already saved in the thunk
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
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.status = 'failed';
        // Clear authentication state on getMe failure
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        // Don't remove token from localStorage here, let the AuthContext handle it
      })
      // Fetch Users
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
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      // Refresh Token
      .addCase(refreshTokenIfNeeded.fulfilled, (state) => {
        // Token refresh successful, extend expiration time
        const newExpirationTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('tokenExpiration', newExpirationTime.toString());
      });
  },
});

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    { name, email }: { name: string; email: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<{ user: User }>('/me', { name, email });
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
    { rejectWithValue }
  ) => {
    try {
      await api.patch('/update-password', { currentPassword, newPassword });
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      );
    }
  }
);

// User management actions
export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'auth/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: { users: User[] } }>('/users');
      return response.data.data.users;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk<User, { name: string; email: string; password: string; role: string }, { rejectValue: string }>(
  'auth/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: { user: User } }>('/users', userData);
      return response.data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk<User, { id: string; userData: Partial<User> }, { rejectValue: string }>(
  'auth/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ data: { user: User } }>(`/users/${id}`, userData);
      return response.data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'auth/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const refreshTokenIfNeeded = createAsyncThunk<void, void, { state: RootState }>(
  'auth/refreshTokenIfNeeded',
  async (_, { getState, dispatch }) => {
    const { auth } = getState();
    const expirationTime = localStorage.getItem('tokenExpiration');

    if (expirationTime && auth.token) {
      const now = Date.now();
      const expiration = parseInt(expirationTime);
      const timeUntilExpiration = expiration - now;

      // If token expires in less than 5 minutes, try to refresh it
      if (timeUntilExpiration < 5 * 60 * 1000 && timeUntilExpiration > 0) {
        console.log('Token expires soon, attempting refresh...');
        try {
          // Try to get fresh user data (this will validate the current token)
          await dispatch(getMe()).unwrap();
          console.log('Token refresh successful');
        } catch (error) {
          console.warn('Token refresh failed, user will need to login again');
          dispatch(logout());
        }
      }
    }
  }
);

export const { logout, clearError, checkTokenExpiration } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
