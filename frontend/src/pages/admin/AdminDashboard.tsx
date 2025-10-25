import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
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
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../store/store';
import { fetchUsers, deleteUser, selectAllUsers, selectUsersStatus, selectUsersError } from '../../features/users/userSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { fetchClients, selectAllClients, selectClientsStatus } from '../../features/clients/clientSlice';
import { fetchAssignedTasks, selectAllTasks, selectTaskStatus } from '../../features/tasks/taskSlice';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const users = useAppSelector(selectAllUsers);
  const usersStatus = useAppSelector(selectUsersStatus);
  const usersError = useAppSelector(selectUsersError);
  const clients = useAppSelector(selectAllClients);
  const clientsStatus = useAppSelector(selectClientsStatus);
  const tasks = useAppSelector(selectAllTasks);
  const tasksStatus = useAppSelector(selectTaskStatus);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchClients());
    dispatch(fetchAssignedTasks() as any);
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

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const regularUsers = totalUsers - adminUsers;

  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.isActive).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'todo').length;

  // Calculate overdue tasks (tasks with due date in the past and not completed)
  const now = new Date();
  const overdueTasks = tasks.filter(task =>
    task.dueDate &&
    new Date(task.dueDate) < now &&
    task.status !== 'completed'
  ).length;

  const statsCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: <PeopleIcon />,
      color: '#3f51b5',
      subtitle: `${adminUsers} admins, ${regularUsers} users`,
    },
    {
      title: 'Total Clients',
      value: totalClients,
      icon: <BusinessIcon />,
      color: '#4caf50',
      subtitle: `${activeClients} active`,
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <TaskIcon />,
      color: '#ff9800',
      subtitle: `${completedTasks} completed`,
    },
    {
      title: 'Overdue Tasks',
      value: overdueTasks,
      icon: <WarningIcon />,
      color: '#f44336',
      subtitle: 'Need attention',
    },
  ];

  if (usersStatus === 'loading' || clientsStatus === 'loading' || tasksStatus === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      borderRadius: 2,
                      p: 1,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/admin/users'}
                  startIcon={<PeopleIcon />}
                >
                  Manage Users
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => window.location.href = '/admin/clients'}
                  startIcon={<BusinessIcon />}
                >
                  Manage Clients
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.location.href = '/tasks'}
                  startIcon={<TaskIcon />}
                >
                  View All Tasks
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Task Status Overview
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${completedTasks} Completed`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<ScheduleIcon />}
                  label={`${inProgressTasks} In Progress`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<TaskIcon />}
                  label={`${pendingTasks} Pending`}
                  color="warning"
                  variant="outlined"
                />
                {overdueTasks > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={`${overdueTasks} Overdue`}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Users */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Users
              </Typography>
              {usersError ? (
                <Alert severity="error">{usersError}</Alert>
              ) : users.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No users found
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.slice(0, 5).map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === 'admin' ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => handleDeleteUser(user._id)}
                              color="error"
                              size="small"
                              disabled={usersStatus === 'loading'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Clients
              </Typography>
              {clients.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No clients found
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clients.slice(0, 5).map((client) => (
                        <TableRow key={client._id}>
                          <TableCell>{client.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={client.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={client.isActive ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
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