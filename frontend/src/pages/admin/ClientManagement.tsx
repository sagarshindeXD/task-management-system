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

interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { token } = useAppSelector((state: RootState) => state.auth);

  // TODO: Replace with actual API call to fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        // const response = await fetch('/api/admin/clients', {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // const data = await response.json();
        // setClients(data);
        
        // Mock data for now
        setClients([
          { _id: '1', name: 'Client A', email: 'clientA@example.com', phone: '+1234567890', isActive: true, createdAt: new Date().toISOString() },
          { _id: '2', name: 'Client B', email: 'clientB@example.com', phone: '+1987654321', isActive: false, createdAt: new Date().toISOString() },
        ]);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setSnackbar({ open: true, message: 'Failed to fetch clients', severity: 'error' });
      }
    };

    fetchClients();
  }, [token]);

  const handleOpenAddDialog = () => {
    setCurrentClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setCurrentClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
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
      // TODO: Implement API call to create/update client
      if (currentClient) {
        // Update client
        // await updateClient(currentClient._id, formData, token);
        setSnackbar({ open: true, message: 'Client updated successfully', severity: 'success' });
      } else {
        // Create client
        // await createClient(formData, token);
        setSnackbar({ open: true, message: 'Client created successfully', severity: 'success' });
      }
      setOpenDialog(false);
      // Refresh clients list
      // const response = await fetchClients();
      // setClients(response.data);
    } catch (error) {
      console.error('Error saving client:', error);
      setSnackbar({ open: true, message: 'Failed to save client', severity: 'error' });
    }
  };

  const handleOpenDeleteDialog = (client: Client) => {
    setCurrentClient(client);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteClient = async () => {
    if (!currentClient) return;
    
    try {
      // TODO: Implement API call to delete client
      // await deleteClient(currentClient._id, token);
      setSnackbar({ open: true, message: 'Client deleted successfully', severity: 'success' });
      setOpenDeleteDialog(false);
      // Refresh clients list
      // const response = await fetchClients();
      // setClients(response.data);
    } catch (error) {
      console.error('Error deleting client:', error);
      setSnackbar({ open: true, message: 'Failed to delete client', severity: 'error' });
    }
  };

  const toggleClientStatus = async (client: Client) => {
    try {
      // TODO: Implement API call to toggle client status
      // await updateClientStatus(client._id, !client.isActive, token);
      setSnackbar({ 
        open: true, 
        message: `Client ${!client.isActive ? 'activated' : 'deactivated'} successfully`, 
        severity: 'success' 
      });
      // Refresh clients list
      // const response = await fetchClients();
      // setClients(response.data);
    } catch (error) {
      console.error('Error updating client status:', error);
      setSnackbar({ open: true, message: 'Failed to update client status', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
                <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
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
                    onClick={() => toggleClientStatus(client)}
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
