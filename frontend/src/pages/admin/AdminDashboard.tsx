import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { fetchUsers, deleteUser, createUser, updateUser } from '../../features/auth/authSlice';
import { fetchClients, deleteClient, createClient, updateClient } from '../../features/clients/clientSlice';

// Types
type User = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type Client = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
};

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { users, status: userStatus } = useAppSelector((state) => state.auth);
  const { clients, status: clientStatus } = useAppSelector((state) => state.clients);
  
  // State for modals and forms
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<Partial<User> | null>(null);
  const [currentClientData, setCurrentClientData] = useState<Partial<Client> | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchClients());
  }, [dispatch]);

  // User management handlers
  const handleOpenUserDialog = (user: Partial<User> | null = null) => {
    setCurrentUserData(user || { name: '', email: '', role: 'user', password: '' });
    setUserDialogOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserData) return;
    
    try {
      if (currentUserData._id) {
        await dispatch(updateUser(currentUserData)).unwrap();
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await dispatch(createUser(currentUserData)).unwrap();
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      setUserDialogOpen(false);
      dispatch(fetchUsers());
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Error processing user', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        dispatch(fetchUsers());
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.message || 'Error deleting user', 
          severity: 'error' 
        });
      }
    }
  };

  // Client management handlers
  const handleOpenClientDialog = (client: Partial<Client> | null = null) => {
    setCurrentClientData(client || { name: '', email: '', phone: '', status: 'active' });
    setClientDialogOpen(true);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClientData) return;
    
    try {
      if (currentClientData._id) {
        await dispatch(updateClient({ id: currentClientData._id, clientData: currentClientData })).unwrap();
        setSnackbar({ open: true, message: 'Client updated successfully', severity: 'success' });
      } else {
        await dispatch(createClient(currentClientData)).unwrap();
        setSnackbar({ open: true, message: 'Client created successfully', severity: 'success' });
      }
      setClientDialogOpen(false);
      dispatch(fetchClients());
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Error processing client', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await dispatch(deleteClient(clientId)).unwrap();
        setSnackbar({ open: true, message: 'Client deleted successfully', severity: 'success' });
        dispatch(fetchClients());
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: error.message || 'Error deleting client', 
          severity: 'error' 
        });
      }
    }
  };

  // Stats calculation
  const stats = [
    { 
      title: 'Total Users', 
      value: users.length.toString(), 
      icon: <PersonAddIcon fontSize="large" /> 
    },
    { 
      title: 'Active Clients', 
      value: clients.filter(c => c.status === 'active').length.toString(), 
      icon: <BusinessIcon fontSize="large" /> 
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box sx={{ mr: 2 }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Users Section */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="User Management"
          action={
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PersonAddIcon />}
              onClick={() => handleOpenUserDialog()}
            >
              Add User
            </Button>
          }
        />
        <TableContainer>
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
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenUserDialog(user)}
                      color="primary"
                      disabled={user._id === currentUser?._id}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteUser(user._id)}
                      color="error"
                      disabled={user._id === currentUser?._id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Clients Section */}
      <Card>
        <CardHeader
          title="Client Management"
          action={
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenClientDialog()}
            >
              Add Client
            </Button>
          }
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Box 
                      component="span" 
                      sx={{
                        color: client.status === 'active' ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenClientDialog(client)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClient(client._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
        <form onSubmit={handleUserSubmit}>
          <DialogTitle>{currentUserData?._id ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentUserData?.name || ''}
              onChange={(e) => setCurrentUserData({...currentUserData, name: e.target.value})}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={currentUserData?.email || ''}
              onChange={(e) => setCurrentUserData({...currentUserData, email: e.target.value})}
              required
              sx={{ mb: 2 }}
            />
            {!currentUserData?._id && (
              <TextField
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={currentUserData?.password || ''}
                onChange={(e) => setCurrentUserData({...currentUserData, password: e.target.value})}
                required={!currentUserData?._id}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              select
              margin="dense"
              label="Role"
              fullWidth
              variant="outlined"
              value={currentUserData?.role || 'user'}
              onChange={(e) => setCurrentUserData({...currentUserData, role: e.target.value as 'user' | 'admin'})}
              required
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentUserData?._id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Client Dialog */}
      <Dialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)}>
        <form onSubmit={handleClientSubmit}>
          <DialogTitle>{currentClientData?._id ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Client Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentClientData?.name || ''}
              onChange={(e) => setCurrentClientData({...currentClientData, name: e.target.value})}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={currentClientData?.email || ''}
              onChange={(e) => setCurrentClientData({...currentClientData, email: e.target.value})}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Phone"
              type="tel"
              fullWidth
              variant="outlined"
              value={currentClientData?.phone || ''}
              onChange={(e) => setCurrentClientData({...currentClientData, phone: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              label="Status"
              fullWidth
              variant="outlined"
              value={currentClientData?.status || 'active'}
              onChange={(e) => setCurrentClientData({...currentClientData, status: e.target.value as 'active' | 'inactive'})}
              required
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClientDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentClientData?._id ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity as 'success' | 'error'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );

export default AdminDashboard;
