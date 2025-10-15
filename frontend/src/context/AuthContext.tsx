import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, selectCurrentUser, selectIsAuthenticated, selectAuthStatus, logout, checkTokenExpiration } from '../features/auth/authSlice';
import { RootState } from '../store/store';

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

      // First check if token is expired
      dispatch(checkTokenExpiration());

      if (token && !isAuthenticated) {
        try {
          console.log('Checking authentication on app start...');
          await dispatch(getMe() as any).unwrap();
          console.log('Authentication check successful');
          resetSessionTimeout(); // Start session timeout
        } catch (error) {
          console.error('Failed to fetch user data on app start:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
        }
      } else if (!token) {
        console.log('No token found, user not authenticated');
      }
      setLoading(false);
    };

    if (authStatus === 'idle') {
      checkAuth();
    } else if (authStatus === 'succeeded' || authStatus === 'failed') {
      setLoading(false);
    }
  }, [dispatch, isAuthenticated, authStatus]);

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
