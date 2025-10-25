import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, selectCurrentUser, selectIsAuthenticated, selectAuthStatus, logout, checkTokenExpiration } from '../features/auth/authSlice';
import { RootState } from '../store/store';
import { store } from '../store/store';

// Define API base URL
const API_BASE_URL = 'https://task-management-system-rimh.onrender.com/api';
console.log('Using API base URL:', API_BASE_URL);

type AuthContextType = {
  user: any;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);

  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Session timeout duration (30 minutes)
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  // Function to reset session timeout
  const resetSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    if (isAuthenticated) {
      const timeout = setTimeout(() => {
        console.log('Session expired due to inactivity');
        dispatch(logout());
        if (typeof window !== 'undefined') {
          alert('Your session has expired due to inactivity. Please log in again.');
        }
      }, SESSION_TIMEOUT_MS);

      setSessionTimeout(timeout);
    }
  };

  // Reset session timeout on user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      if (isAuthenticated) {
        resetSessionTimeout();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('No token found, user not authenticated');
        setLoading(false);
        return;
      }

      // Check if token is expired first
      dispatch(checkTokenExpiration());

      // Check current auth state after expiration check
      const currentAuthState = store.getState().auth;

      if (currentAuthState.isAuthenticated && currentAuthState.user) {
        console.log('User already authenticated and has user data');
        setLoading(false);
        resetSessionTimeout();
        return;
      }

      if (currentAuthState.error && currentAuthState.error.includes('expired')) {
        console.log('Token expired, user needs to login again');
        setLoading(false);
        return;
      }

      // If we have a token but no user data and no error, try to fetch user data
      if (token && !currentAuthState.user && !currentAuthState.error) {
        try {
          console.log('Validating token and fetching user data...');
          await dispatch(getMe() as any).unwrap();
          console.log('Token validation successful');
          resetSessionTimeout();
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
        }
      }

      setLoading(false);
    };

    if (authStatus === 'idle') {
      checkAuth();
    } else if (authStatus === 'succeeded' || authStatus === 'failed') {
      setLoading(false);
    }
  }, [dispatch, authStatus]);

  // Cleanup session timeout on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [sessionTimeout]);

  const handleLogout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    dispatch(logout());
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout: handleLogout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
