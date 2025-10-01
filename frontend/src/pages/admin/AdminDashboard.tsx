import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
};

// Use Render backend URL in production, fallback to localhost in development
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://task-management-system-rimh.onrender.com/api' 
  : 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const url = `${API_BASE_URL}/users`;
        console.log('Fetching users from:', url);
        
        // Log request details
        console.log('Request headers:', {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Include cookies if needed
        });

        // Log response status and headers
        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        // Get response text first to check if it's valid JSON
        const responseText = await response.text();
        console.log('Raw response text:', responseText);

        if (!response.ok) {
          // Try to parse as JSON if possible, otherwise use text
          let errorMessage = `Failed to fetch users: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If not JSON, use the text response
            if (responseText.startsWith('<!DOCTYPE html>')) {
              errorMessage = 'Received HTML instead of JSON. Check if the API endpoint is correct.';
            } else {
              errorMessage = responseText || errorMessage;
            }
          }
          throw new Error(errorMessage);
        }

        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          throw new Error('Invalid JSON response from server');
        }
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.warn('Unexpected response format:', data);
          throw new Error('Unexpected response format from server');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to load users',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

console.log('Deleting user:', `${API_BASE_URL}/users/${userId}`);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete error response:', errorData);
        throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
      }

      // Optimistically update the UI
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to delete user',
        severity: 'error'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleDeleteUser(user._id)}
                      color="error"
                      disabled={(currentUser && user._id === currentUser._id) || deleting}
                      aria-label="delete user"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;