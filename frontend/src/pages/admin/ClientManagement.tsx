import React, { useState, useEffect, useRef } from 'react';
import { useA11yDialog } from '../../hooks/useA11yDialog';
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
  createClient,
  updateClient,
  deleteClient as deleteClientApi,
  Client
} from '../../services/clientService';
import { deleteClient, fetchClients, selectAllClients, selectClientsStatus, selectClientsError, updateClientStatus } from '../../features/clients/clientSlice';


const ClientManagement = () => {
  // Redux state
  const clients = useAppSelector(selectAllClients);
  const clientsStatus = useAppSelector(selectClientsStatus);
  const clientsError = useAppSelector(selectClientsError);

  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [formData, setFormData] = useState({
    name: '',
  });

  // Use the a11y dialog hook
  const { rootRef, mainContentRef } = useA11yDialog(false);

  // Update the dialog state when open states change
  useEffect(() => {
    if (rootRef.current && mainContentRef.current) {
      mainContentRef.current.inert = openDialog;
      if (openDialog) {
        mainContentRef.current.setAttribute('aria-hidden', 'true');
      } else {
        mainContentRef.current.removeAttribute('aria-hidden');
      }
    }
  }, [openDialog, rootRef, mainContentRef]);

  const { token } = useAppSelector((state: RootState) => state.auth);

  const dispatch = useAppDispatch();

  // Log clients when they change
  useEffect(() => {
    console.log('Current clients:', clients);
  }, [clients]);

  // Fetch clients on component mount and when token changes
  useEffect(() => {
    if (token) {
      dispatch(fetchClients());
    }
  }, [token, dispatch]);

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
        console.log('Updating client:', currentClient._id, formData);
        await updateClient(currentClient._id, formData, token);
        setSnackbar({
          open: true,
          message: 'Client updated successfully',
          severity: 'success'
        });
      } else {
        // Create new client
        console.log('Creating new client:', formData);
        const newClient = await createClient(formData, token);
        console.log('New client created:', newClient);
        setSnackbar({
          open: true,
          message: 'Client created successfully',
          severity: 'success'
        });
      }

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
  const handleDeleteClient = async (clientId: string) => {
    console.log('Attempting to delete client:', clientId);

    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Dispatching deleteClient action...');
      await dispatch(deleteClient(clientId)).unwrap();
      console.log('Client deleted successfully');
      setSnackbar({
        open: true,
        message: 'Client deleted successfully',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Delete client failed:', error);
      console.log('Error object structure:', JSON.stringify(error, null, 2));

      // Try multiple ways to extract the error message
      let errorMessage = 'Failed to delete client';
      let statusCode: number | undefined;

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        statusCode = error.response.status;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
        statusCode = error.response.status;
      } else if (error?.message) {
        errorMessage = error.message;
        statusCode = error?.status || error?.response?.status;
      } else if (error?.payload) {
        // Redux Toolkit error format
        errorMessage = error.payload;
      }

      console.log('Extracted error message:', errorMessage);
      console.log('Status code:', statusCode);

      let displayMessage = errorMessage;
      if (statusCode === 404) {
        displayMessage = 'Client not found or you do not have permission to delete it. It may have been deleted by another user.';
      } else if (statusCode === 400) {
        displayMessage = errorMessage; // Show the specific validation error (e.g., has associated tasks)
      } else if (statusCode === 403) {
        displayMessage = 'You do not have permission to delete this client.';
      }

      setSnackbar({
        open: true,
        message: displayMessage,
        severity: 'error'
      });
    }
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setCurrentClient(null);
    setFormData({ name: '' });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setCurrentClient(client);
    setFormData({
      name: client.name
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentClient(null);
    setFormData({ name: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Toggle client active status
  const handleToggleStatus = async (client: Client) => {
    if (!client._id || !token) return;

    const newStatus = !client.isActive;

    try {
      // Make the API call using Redux
      await dispatch(updateClientStatus({ id: client._id, isActive: newStatus }));

      setSnackbar({
        open: true,
        message: `Client ${newStatus ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
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

        {clientsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {clientsError}
          </Alert>
        )}

        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No clients found
                </TableCell>
              </TableRow>
            ) : clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell>{client.name}</TableCell>
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
                    onClick={() => client._id && handleDeleteClient(client._id)}
                    color="error"
                    disabled={clientsStatus === 'loading'}
                    aria-label="delete client"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Client Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
        aria-modal="true"
        role="dialog"
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle id="client-dialog-title">
            {currentClient ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentClient ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
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
