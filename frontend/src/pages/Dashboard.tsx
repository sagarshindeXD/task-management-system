import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchTasks, Task, fetchDashboardMetrics } from '../features/tasks/taskSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import { Link, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  useTheme,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
// Grid replaced with Box for layout
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  PendingActions as InProgressIcon,
  AssignmentLate as TodoIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'admin';

  // Redirect non-admin users to tasks page
  if (!isAdmin) {
    return <Navigate to="/tasks" replace />;
  }

  const { tasks, status } = useAppSelector((state) => state.tasks);
  const dashboardMetrics = useAppSelector((state) => state.tasks.dashboardMetrics);

  useEffect(() => {
    dispatch(fetchTasks());

    // Fetch dashboard metrics if user is admin
    if (isAdmin) {
      dispatch(fetchDashboardMetrics());
    }
  }, [dispatch, isAdmin]);

  // Filter and sort tasks
  const recentTasks = [...tasks]
    .sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const completedTasks = tasks.filter((task: Task) => task.status === 'completed');
  const inProgressTasks = tasks.filter((task: Task) => task.status === 'in-progress');
  const todoTasks = tasks.filter((task: Task) => task.status === 'todo');

  const upcomingDeadlines = tasks
    .filter((task: Task) => task.dueDate)
    .sort((a: Task, b: Task) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  // Get status icon with color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="primary" />;
      default:
        return <TodoIcon color="action" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      default:
        return 'success.main';
    }
  };

  if (status === 'loading' && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/tasks/new"
        >
          New Task
        </Button>
      </Box>

      {/* Admin Dashboard Metrics */}
      {isAdmin && (
        <>
          {/* User Metrics */}
          {dashboardMetrics?.users && dashboardMetrics.users.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  User Performance
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell align="center">Assigned</TableCell>
                      <TableCell align="center">Done</TableCell>
                      <TableCell align="center">Pending</TableCell>
                      <TableCell align="center">Delayed</TableCell>
                      <TableCell align="center">In Review</TableCell>
                      <TableCell align="center">Working</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardMetrics.users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell component="th" scope="row">
                          {user.name}
                        </TableCell>
                        <TableCell align="center">{user.tasksAssigned}</TableCell>
                        <TableCell align="center">{user.doneTasks}</TableCell>
                        <TableCell align="center">{user.pendingTasks}</TableCell>
                        <TableCell align="center">{user.delayedTasks}</TableCell>
                        <TableCell align="center">{user.inReviewTasks}</TableCell>
                        <TableCell align="center">{user.workingTasks}</TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={user.performance}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="body2">{Math.round(user.performance)}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  User Performance
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                User performance data is currently unavailable.
              </Typography>
            </Paper>
          )}

          {/* Department Metrics */}
          {dashboardMetrics?.departments && dashboardMetrics.departments.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Department Performance Analysis
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="center">Total Tasks</TableCell>
                      <TableCell align="center">Completed</TableCell>
                      <TableCell align="center">In Progress</TableCell>
                      <TableCell align="center">Pending</TableCell>
                      <TableCell align="center">Delayed</TableCell>
                      <TableCell align="center">In Review</TableCell>
                      <TableCell align="center">Completion Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardMetrics.departments.map((dept) => {
                      const totalTasks = dept.tasksAssigned;
                      const completedTasks = dept.doneTasks;
                      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                      return (
                        <TableRow key={dept.name}>
                          <TableCell component="th" scope="row">
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {dept.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {totalTasks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                              {completedTasks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                              {dept.workingTasks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                              {dept.pendingTasks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                              {dept.delayedTasks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {dept.inReviewTasks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={completionRate}
                                sx={{ width: 60, mr: 1 }}
                              />
                              <Typography variant="body2">{completionRate}%</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Department Performance Analysis
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                Department performance data is currently unavailable.
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Stats Cards */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
        '& > *': {
          flex: '1 1 250px',
          minWidth: 0
        }
      }}>
        <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h4" component="h2">
                  {tasks.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                <TaskIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  To Do
                </Typography>
                <Typography variant="h4" component="h2">
                  {todoTasks.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                <TodoIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4" component="h2">
                  {inProgressTasks.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                <InProgressIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4" component="h2">
                  {completedTasks.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                <CompletedIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Recent Tasks */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 0%' } }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h2">
                Recent Tasks
              </Typography>
              <Button
                component={Link}
                to="/tasks"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>

            {status === 'loading' ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress color="primary" />
              </Box>
            ) : recentTasks.length > 0 ? (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {recentTasks.map((task) => (
                  <React.Fragment key={task._id}>
                    <ListItem
                      alignItems="flex-start"
                      component={Link}
                      to={`/tasks/${task._id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                      }}
                    >
                      <ListItemAvatar>
                        {getStatusIcon(task.status)}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                              variant="subtitle1"
                              component="span"
                              sx={{
                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Box
                              component="span"
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: getPriorityColor(task.priority),
                                display: 'inline-block',
                                ml: 1,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {task.description || 'No description'}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {format(new Date(task.createdAt), 'MMM d, yyyy')}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {task.status !== 'completed' && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" p={3}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No tasks found
                </Typography>
                <Button
                  component={Link}
                  to="/tasks/new"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Create your first task
                </Button>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Quick Actions & Upcoming Deadlines */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 0%' }, maxWidth: { md: '400px' } }}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                component={Link}
                to="/tasks/new"
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, textTransform: 'none' }}
              >
                Create New Task
              </Button>
              <Button
                component={Link}
                to="/tasks?status=todo"
                variant="outlined"
                fullWidth
                startIcon={<TodoIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, textTransform: 'none' }}
              >
                View To Do Tasks
              </Button>
              <Button
                component={Link}
                to="/tasks?status=in-progress"
                variant="outlined"
                fullWidth
                startIcon={<InProgressIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, textTransform: 'none' }}
              >
                View In Progress
              </Button>
              <Button
                component={Link}
                to="/tasks?status=completed"
                variant="outlined"
                fullWidth
                startIcon={<CompletedIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, textTransform: 'none' }}
              >
                View Completed
              </Button>
            </Box>
          </Paper>

          {/* Upcoming Deadlines */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Upcoming Deadlines
            </Typography>
            {upcomingDeadlines.length > 0 ? (
              <List>
                {upcomingDeadlines.map((task) => (
                  <React.Fragment key={task._id}>
                    <ListItem
                      alignItems="flex-start"
                      component={Link}
                      to={`/tasks/${task._id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                              variant="subtitle2"
                              component="span"
                              sx={{
                                fontWeight: 500,
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                bgcolor: 'action.selected',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                              }}
                            >
                              {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming deadlines
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
