import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { store } from '../store/store';
import { RootState } from '../store/store';
import {
  fetchAssignedTasks,
  fetchMyCompletedTasks,
  fetchTeamTasks,
  deleteTask,
  selectTaskStatus,
  selectTaskError,
  selectMyCompletedTasks,
  selectTeamTasks,
} from '../features/tasks/taskSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CompletedIcon,
  PendingActions as InProgressIcon,
  AssignmentLate as TodoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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

  // Local state for tabs
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const state = store.getState() as RootState;
        if (state.auth.isAuthenticated) {
          await dispatch(fetchAssignedTasks() as any);
          // Fetch additional data if endpoints are available
          try {
            await dispatch(fetchMyCompletedTasks() as any);
          } catch (error) {
            console.warn('My completed tasks endpoint not available:', error);
          }
          try {
            await dispatch(fetchTeamTasks() as any);
          } catch (error) {
            console.warn('Team tasks endpoint not available:', error);
          }
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
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        // Refresh data after deletion
        try {
          await dispatch(fetchAssignedTasks() as any);
          await dispatch(fetchMyCompletedTasks() as any);
          await dispatch(fetchTeamTasks() as any);
        } catch (error) {
          console.warn('Error refreshing task data after deletion:', error);
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    setSelectedTask(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" fontSize="small" />;
      case 'in-progress':
        return <InProgressIcon color="primary" fontSize="small" />;
      default:
        return <TodoIcon color="action" fontSize="small" />;
    }
  };

  const renderTaskList = (tasks: any[], title: string, emptyMessage: string) => {
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
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List disablePadding>
          {tasks.map((task, index) => (
            <React.Fragment key={task._id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="more"
                    onClick={() => setSelectedTask(task._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" flexWrap="wrap">
                      <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{
                          mr: 1,
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.title}
                      </Typography>

                      <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                        <Chip
                          label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            ...(task.status === 'completed' && {
                              borderColor: 'success.main',
                              color: 'success.main',
                              bgcolor: 'success.light',
                            }),
                            ...(task.status === 'in-progress' && {
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              bgcolor: 'primary.light',
                            }),
                          }}
                        />

                        {task.dueDate && (
                          <Chip
                            icon={
                              new Date(task.dueDate) < new Date() && task.status !== 'completed' ? (
                                <Tooltip title="Overdue">
                                  <span style={{ display: 'flex' }}>⚠️</span>
                                </Tooltip>
                              ) : undefined
                            }
                            label={format(new Date(task.dueDate), 'MMM d, yyyy')}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              ...(new Date(task.dueDate) < new Date() && task.status !== 'completed' && {
                                borderColor: 'error.main',
                                color: 'error.main',
                                bgcolor: 'error.light',
                              }),
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          ...(task.status === 'completed' && {
                            textDecoration: 'line-through',
                          }),
                        }}
                      >
                        {task.description || 'No description'}
                      </Typography>

                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>

              {index < tasks.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>

        {/* Task menu */}
        {selectedTask && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setSelectedTask(null)}
          >
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Button
                fullWidth
                startIcon={<EditIcon />}
                onClick={() => handleEditTask(selectedTask)}
                sx={{ mb: 1 }}
              >
                Edit
              </Button>
              <Button
                fullWidth
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteTask(selectedTask)}
                color="error"
              >
                Delete
              </Button>
            </Paper>
          </Box>
        )}
      </Paper>
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
            {renderTaskList(
              [], // This would be populated with assigned tasks
              'Assigned Tasks',
              'No tasks have been assigned to you yet.'
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Completed Tasks
            </Typography>
            {renderTaskList(
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
            {renderTaskList(
              teamTasks,
              'Team Tasks',
              'No team tasks found.'
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Team Completed Tasks
            </Typography>
            {renderTaskList(
              [], // This would be populated with team completed tasks
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
