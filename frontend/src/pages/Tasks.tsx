import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { store } from '../store/store';
import { RootState } from '../store/store';
import {
  fetchAssignedTasks,
  fetchMyCompletedTasks,
  fetchTeamTasks,
  fetchTeamCompletedTasks,
  deleteTask,
  selectTaskStatus,
  selectTaskError,
  selectMyCompletedTasks,
  selectTeamTasks,
  selectTeamCompletedTasks,
  selectAllTasks,
  updateTaskStatus,
  User,
} from '../features/tasks/taskSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Custom TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get user info
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'admin';

  // Get task data
  const status = useAppSelector(selectTaskStatus);
  const error = useAppSelector(selectTaskError);
  const myCompletedTasks = useAppSelector(selectMyCompletedTasks);
  const teamTasks = useAppSelector(selectTeamTasks);
  const teamCompletedTasks = useAppSelector(selectTeamCompletedTasks);
  const assignedTasks = useAppSelector(selectAllTasks); // Get the tasks from state

  // Local state for tabs
  const [activeTab, setActiveTab] = useState(0);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const state = store.getState() as RootState;
        if (state.auth.isAuthenticated) {
          await dispatch(fetchAssignedTasks() as any);
          // These endpoints return real data from backend now
          await dispatch(fetchMyCompletedTasks() as any);
          await dispatch(fetchTeamTasks() as any);
          await dispatch(fetchTeamCompletedTasks() as any);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/tasks/${taskId}/edit`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        // Refresh data after deletion
        await dispatch(fetchAssignedTasks() as any);
        await dispatch(fetchMyCompletedTasks() as any);
        await dispatch(fetchTeamTasks() as any);
        await dispatch(fetchTeamCompletedTasks() as any);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const getStatusValue = (status: string) => {
    switch (status) {
      case 'completed':
        return 'done';
      case 'in-progress':
        return 'working';
      case 'todo':
        return 'pending';
      case 'overdue':
        return 'overdue';
      default:
        return 'pending';
    }
  };

  const getStatusFromValue = (value: string) => {
    switch (value) {
      case 'done':
        return 'completed';
      case 'working':
        return 'in-progress';
      case 'pending':
        return 'todo';
      case 'overdue':
        return 'overdue';
      default:
        return 'todo';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#f44336'; // Red
      case 'medium':
        return '#ff9800'; // Orange
      case 'low':
        return '#4caf50'; // Green
      default:
        return '#757575'; // Gray
    }
  };

  const getTaskRowStyle = (task: any) => {
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < now && task.status !== 'completed';

    if (isOverdue) {
      return { backgroundColor: 'rgba(244, 67, 54, 0.1)' }; // Light red for overdue
    }

    return {};
  };

  const getPriorityChipColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await dispatch(updateTaskStatus({ id: taskId, status: getStatusFromValue(newStatus) })).unwrap();
      // Refresh data after status update
      await dispatch(fetchAssignedTasks() as any);
      await dispatch(fetchMyCompletedTasks() as any);
      await dispatch(fetchTeamTasks() as any);
      await dispatch(fetchTeamCompletedTasks() as any);
    } catch (error: any) {
      console.error('Failed to update task status:', error);
    }
  };

  const renderTaskTable = (tasks: any[], title: string, emptyMessage: string) => {
    if (status === 'loading' && tasks.length === 0) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (tasks.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            No {title.toLowerCase()} found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Assigned By</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assign Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task._id}
                hover
                sx={getTaskRowStyle(task)}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {typeof task.client === 'object' ? task.client.name : task.client || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.department || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {typeof task.assignedBy === 'object' ? task.assignedBy.name : task.assignedBy || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.assignedTo && task.assignedTo.length > 0
                      ? task.assignedTo.map((assigned: User | string) =>
                          typeof assigned === 'object' ? assigned.name : assigned
                        ).join(', ')
                      : 'N/A'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority?.toUpperCase() || 'MEDIUM'}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(task.priority || 'medium'),
                      color: 'white',
                      fontWeight: 600,
                    }}
                    color={getPriorityChipColor(task.priority || 'medium')}
                    variant="filled"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.assignDate ? format(new Date(task.assignDate), 'MMM d, yyyy') : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
                        ? 'error.main'
                        : 'inherit',
                      fontWeight: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
                        ? 600
                        : 'normal'
                    }}
                  >
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={getStatusValue(task.status)}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      displayEmpty
                      sx={{ fontSize: '0.875rem' }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="working">Working</MenuItem>
                      <MenuItem value="done">Done</MenuItem>
                      <MenuItem value="overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Box
                    display="flex"
                    gap={0.5}
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{
                      minHeight: '40px',
                      padding: '4px 0'
                    }}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditTask(task._id)}
                        sx={{
                          padding: '6px',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTask(task._id)}
                        color="error"
                        sx={{
                          padding: '6px',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (!currentUser) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {isAdmin ? 'Admin Tasks' : 'My Tasks'}
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
          sx={{ textTransform: 'none' }}
        >
          New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="task tabs">
            <Tab label="My Tasks" {...a11yProps(0)} />
            <Tab label="Team Tasks" {...a11yProps(1)} />
            {isAdmin && <Tab label="Dashboard" {...a11yProps(2)} />}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Assigned Tasks
            </Typography>
            {renderTaskTable(
              assignedTasks,
              'Assigned Tasks',
              'No tasks have been assigned to you yet.'
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Completed Tasks
            </Typography>
            {renderTaskTable(
              myCompletedTasks,
              'Completed Tasks',
              'You haven\'t completed any tasks yet.'
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Team Assigned Tasks
            </Typography>
            {renderTaskTable(
              teamTasks,
              'Team Tasks',
              'No team tasks found.'
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Team Completed Tasks
            </Typography>
            {renderTaskTable(
              teamCompletedTasks,
              'Team Completed Tasks',
              'No completed tasks in the team yet.'
            )}
          </Box>
        </TabPanel>

        {isAdmin && (
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Dashboard content for admins would go here.
            </Typography>
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

export default Tasks;
