import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../store/store';
import { fetchUsers, selectAllUsers, selectUsersStatus, selectUsersError } from '../../features/users/userSlice';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const usersStatus = useAppSelector(selectUsersStatus);
  const usersError = useAppSelector(selectUsersError);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  // Fetch users when component mounts
  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(fetchUsers());
    } else if (usersStatus === 'failed') {
      setSnackbar({ open: true, message: usersError || 'Failed to fetch users', severity: 'error' });
    }
  }, [dispatch, usersStatus, usersError]);

  const handleRefreshUsers = () => {
    dispatch(fetchUsers());
  };

  const handleOpenAddDialog = () => {
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to create/update user
      if (currentUser) {
        // Update user
        // await updateUser(currentUser._id, formData, token);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        // Create user
        // await createUser(formData, token);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      setOpenDialog(false);
      handleRefreshUsers(); // Refresh users list
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({ open: true, message: 'Failed to save user', severity: 'error' });
    }
  };

  const handleOpenDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      // TODO: Implement API call to delete user
      // await deleteUser(currentUser._id, token);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      setOpenDeleteDialog(false);
      handleRefreshUsers(); // Refresh users list
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersStatus === 'loading' ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : usersStatus === 'failed' ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="error">
                    Error: {usersError || 'Failed to load users'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: User) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(user)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(user)}
                      size="small"
                      disabled={user.role === 'admin'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required={!currentUser}
              />
              <TextField
                select
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                margin="normal"
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user "{currentUser?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity as 'success' | 'error'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
