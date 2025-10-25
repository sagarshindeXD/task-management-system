import React, { useEffect } from 'react';
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
  Typography,
  Button
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../store/store';
import { fetchUsers, deleteUser, selectAllUsers, selectUsersStatus, selectUsersError } from '../../features/users/userSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import api from '../../utils/axios';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
};

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const users = useAppSelector(selectAllUsers);
  const usersStatus = useAppSelector(selectUsersStatus);
  const usersError = useAppSelector(selectUsersError);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Debug current user information
  useEffect(() => {
    console.log('=== ADMIN DASHBOARD DEBUG INFO ===');
    console.log('Current user:', currentUser);
    console.log('Current user role:', currentUser?.role);
    console.log('Current user ID:', currentUser?._id);
    console.log('Users in state:', users);
    console.log('Users status:', usersStatus);
    console.log('Users error:', usersError);
    console.log('LocalStorage token:', localStorage.getItem('token'));
    console.log('=== END DEBUG INFO ===');
  }, [currentUser, users, usersStatus, usersError]);

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteUser = async (userId: string) => {
    console.log('Attempting to delete user:', userId);

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Dispatching deleteUser action...');
      await dispatch(deleteUser(userId)).unwrap();
      console.log('User deleted successfully');
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Delete user failed:', error);
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  const handleTestAuth = async () => {
    try {
      console.log('Testing authentication...');
      const response = await api.get('/users/test-auth');
      console.log('Auth test response:', response.data);
      setSnackbar({
        open: true,
        message: `Auth test successful! Role: ${response.data.data.user.role}`,
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Auth test failed:', error);
      setSnackbar({
        open: true,
        message: `Auth test failed: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (usersStatus === 'loading') {
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

      <Box display="flex" gap={2} mb={2}>
        <Button
          variant="outlined"
          onClick={handleTestAuth}
          disabled={usersStatus === 'loading'}
        >
          Test Authentication
        </Button>
        <Typography variant="body2" color="text.secondary">
          Current role: {currentUser?.role || 'unknown'}
        </Typography>
      </Box>

      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {usersError}
        </Alert>
      )}

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
              users.map((user: User) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleDeleteUser(user._id)}
                      color="error"
                      disabled={usersStatus === 'loading'}
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