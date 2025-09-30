import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import { getMe } from './features/auth/authSlice';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import NewTask from './pages/NewTask';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, status, token } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  // Check if we need to verify the user's session
  useEffect(() => {
    if (token && !isAuthenticated && status !== 'loading') {
      // If we have a token but aren't authenticated, try to get the user data
      dispatch(getMe())
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [token, isAuthenticated, status, dispatch]);

  // If we're still loading the auth state, show a loading indicator
  if (status === 'loading' || isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated and no token, redirect to login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // If we have a token but not authenticated yet, show a loading state
  if (token && !isAuthenticated) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Verifying session...</Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Component
const AppContent = () => {
  const dispatch = useAppDispatch();
  const { status, token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [initialized, setInitialized] = useState(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !isAuthenticated) {
        try {
          await dispatch(getMe()).unwrap();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // Don't clear the token here, let ProtectedRoute handle it
        }
      }
      setInitialized(true);
    };

    initializeAuth();
  }, [dispatch, isAuthenticated]);

  // Show loading state only during initial app load
  if (!initialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <AuthLayout>
                  <Register />
                </AuthLayout>
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/new" element={<NewTask />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  );
};

// App Wrapper with Redux and Theme Providers
const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
