import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, selectCurrentUser, selectIsAuthenticated, selectAuthStatus } from '../features/auth/authSlice';
import { RootState } from '../store/store';

// Define API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://task-management-system-rimh.onrender.com/api';
console.log('Using API base URL:', API_BASE_URL);

type AuthContextType = {
  user: any;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        try {
          await dispatch(getMe() as any).unwrap();
        } catch (error) {
          console.error('Failed to fetch user data on app start:', error);
          // Clear invalid token
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    if (authStatus === 'idle') {
      checkAuth();
    } else if (authStatus === 'succeeded' || authStatus === 'failed') {
      setLoading(false);
    }
  }, [dispatch, isAuthenticated, authStatus]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
