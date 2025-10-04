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
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { RootState } from '../../store/store';
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient as deleteClientApi,
  updateClientStatus,
  Client
} from '../../services/clientService';


const ClientManagement = () => {
  // State management
  const [clients, setClients] = useState<Client[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { token } = useAppSelector((state: RootState) => state.auth);

  // Fetch clients on component mount and when token changes
  useEffect(() => {
    const loadClients = async () => {
      if (!token) return;
      
      try {
        const clientsData = await fetchClients(token);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load clients',
          severity: 'error'
        });
      }
    };

    loadClients();
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (currentClient?._id) {
        // Update existing client
        await updateClient(currentClient._id, formData, token);
        setSnackbar({
          open: true,
          message: 'Client updated successfully',
          severity: 'success'
        });
      } else {
        // Create new client
        await createClient(formData, token);
        setSnackbar({
          open: true,
          message: 'Client created successfully',
          severity: 'success'
        });
      }

      // Refresh clients list
      const clientsData = await fetchClients(token);
      setClients(clientsData);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving client:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save client',
        severity: 'error'
      });
    }
  };

  // Handle client deletion
  const handleDeleteClient = async () => {
    if (!currentClient?._id) {
      setSnackbar({ 
        open: true, 
        message: 'No client selected for deletion', 
        severity: 'error' 
      });
      return;
    }

    if (!token) {
      setSnackbar({ 
        open: true, 
        message: 'Authentication token is missing', 
        severity: 'error' 
      });
      return;
    }

    try {
      await deleteClientApi(currentClient._id, token);
      setSnackbar({ 
        open: true, 
        message: 'Client deleted successfully', 
        severity: 'success' 
      });
      // Refresh the clients list
      const clients = await fetchClients(token);
      setClients(clients);
      setOpenDeleteDialog(false);
      setCurrentClient(null);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to delete client', 
        severity: 'error' 
      });
    }
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setCurrentClient(null);
    setFormData({ name: '', email: '', phone: '' });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setCurrentClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentClient(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleOpenDeleteDialog = (client: Client) => {
    setCurrentClient(client);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentClient(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Toggle client active status
  const handleToggleStatus = async (client: Client) => {
    if (!client._id || !token) return;
    
    try {
      const updatedClient = await updateClientStatus(client._id, !client.isActive, token);
      setSnackbar({
        open: true,
        message: `Client ${updatedClient.isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
      
      // Update the client in the list
      setClients(prevClients => 
        prevClients.map(c => 
          c._id === client._id ? { ...c, isActive: updatedClient.isActive } : c
        )
      );
    } catch (error) {
      console.error('Error toggling client status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update client status',
        severity: 'error'
      });
    }
  };

  // Rest of your component JSX...
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Client Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>{client.phone || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={client.isActive ? 'Active' : 'Inactive'} 
                    color={client.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenEditDialog(client)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color={client.isActive ? 'error' : 'success'}
                    onClick={() => handleToggleStatus(client)}
                    size="small"
                  >
                    {client.isActive ? <DeleteIcon /> : <AddIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Client Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{currentClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
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
              />
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentClient ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the client "{currentClient?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteClient} color="error" variant="contained">
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

export default ClientManagement;
