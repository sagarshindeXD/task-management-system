import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { 
  fetchTaskById, 
  updateTask, 
  deleteTask, 
  selectCurrentTask, 
  selectTaskStatus,
  selectTaskError,
  clearCurrentTask,
} from '../features/tasks/taskSlice';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Divider,
  Chip,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CompletedIcon,
  PendingActions as InProgressIcon,
  AssignmentLate as TodoIcon,
  Person as PersonIcon,
  Label as LabelIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';

const statusOptions = [
  { value: 'todo', label: 'To Do', icon: <TodoIcon /> },
  { value: 'in-progress', label: 'In Progress', icon: <InProgressIcon /> },
  { value: 'completed', label: 'Completed', icon: <CompletedIcon /> },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  status: Yup.string().required('Status is required'),
  priority: Yup.string().required('Priority is required'),
  dueDate: Yup.date().nullable(),
  labels: Yup.array().of(Yup.string()),
});

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Get task and state from Redux
  const task = useAppSelector(selectCurrentTask);
  const status = useAppSelector(selectTaskStatus);
  const error = useAppSelector(selectTaskError);
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // Fetch task details when the component mounts or the ID changes
  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
    
    return () => {
      dispatch(clearCurrentTask());
    };
  }, [dispatch, id]);
  
  // Handle menu actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
    handleMenuClose();
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteConfirm = async () => {
    if (id) {
      await dispatch(deleteTask(id));
      setDeleteDialogOpen(false);
      navigate('/tasks');
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSubmit = async (
    values: any,
    { setSubmitting }: FormikHelpers<any>
  ) => {
    try {
      if (id) {
        await dispatch(updateTask({ id, taskData: values })).unwrap();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
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
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };
  
  if (status === 'loading' && !task) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !task) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!task) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" gutterBottom>
          Task not found
        </Typography>
        <Button 
          component={RouterLink} 
          to="/tasks" 
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
      </Box>
    );
  }
  
  // Initial form values
  const initialValues = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    labels: task.labels || [],
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          component={RouterLink}
          to="/tasks"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none' }}
        >
          Back to Tasks
        </Button>
        
        {!isEditing && (
          <Box>
            <IconButton
              aria-label="more"
              aria-controls="task-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="task-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleEditClick}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Task</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete Task</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
      
      <Paper sx={{ p: 4, borderRadius: 2, mb: 3 }}>
        {isEditing ? (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
              <Form>
                <Box mb={3}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="title"
                    label="Title"
                    variant="outlined"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                    sx={{ mb: 2 }}
                  />
                  
                  <Field
                    as={TextField}
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label="Description"
                    variant="outlined"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: '1 1 100%', '@media (min-width:600px)': { flex: '1 1 calc(50% - 8px)' } }}>
                      <FormControl fullWidth error={touched.status && Boolean(errors.status)}>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                          labelId="status-label"
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="Status"
                        >
                          {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box display="flex" alignItems="center">
                                {React.cloneElement(option.icon, { sx: { mr: 1 } })}
                                {option.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.status && errors.status && (
                          <FormHelperText>{errors.status}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', flex: '1 1 calc(50% - 8px)', '@media (min-width:600px)': { flex: '1 1 calc(50% - 8px)' } }}>
                      <FormControl fullWidth error={touched.priority && Boolean(errors.priority)}>
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Select
                          labelId="priority-label"
                          name="priority"
                          value={values.priority}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="Priority"
                        >
                          {priorityOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box display="flex" alignItems="center">
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: getPriorityColor(option.value),
                                    mr: 1,
                                  }}
                                />
                                {option.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.priority && errors.priority && (
                          <FormHelperText>{errors.priority}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                    
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <TextField
                        fullWidth
                        type="date"
                        name="dueDate"
                        label="Due Date"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        value={values.dueDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.dueDate && Boolean(errors.dueDate)}
                        helperText={touched.dueDate && errors.dueDate}
                      />
                    </Box>
                  
                  {/* Labels input can be added here */}
                </Box>
              </Box>
                
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    startIcon={<CancelIcon />}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {task.title}
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    icon={getStatusIcon(task.status)}
                    label={getStatusLabel(task.status)}
                    size="small"
                    sx={{
                      bgcolor: 'action.selected',
                      '& .MuiChip-icon': {
                        color: theme.palette.mode === 'dark' ? 'inherit' : 'inherit',
                      },
                      ...(task.status === 'completed' && {
                        bgcolor: 'success.light',
                        color: 'success.dark',
                      }),
                      ...(task.status === 'in-progress' && {
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                      }),
                    }}
                  />
                  
                  <Chip
                    label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: `${getPriorityColor(task.priority)}20`,
                      color: getPriorityColor(task.priority),
                      border: `1px solid ${getPriorityColor(task.priority)}`,
                    }}
                  />
                  
                  {task.dueDate && (
                    <Chip
                      icon={<CalendarIcon fontSize="small" />}
                      label={format(new Date(task.dueDate), 'MMM d, yyyy')}
                      size="small"
                      sx={{
                        bgcolor: 'action.selected',
                        ...(new Date(task.dueDate) < new Date() && task.status !== 'completed' && {
                          bgcolor: 'error.light',
                          color: 'error.dark',
                        }),
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, '@media (min-width: 900px)': { flexDirection: 'row' } }}>
              <Box sx={{ flex: 2 }}>
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    Description
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      minHeight: 100,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                    }}
                  >
                    {task.description ? (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {task.description}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No description provided
                      </Typography>
                    )}
                  </Paper>
                </Box>
                
                {/* Task activity or comments section can be added here */}
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    Assigned To
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: 'primary.main',
                          mr: 2,
                        }}
                      >
                        {typeof task.createdBy === 'object' 
                          ? task.createdBy.name?.charAt(0)?.toUpperCase() 
                          : task.createdBy?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {typeof task.createdBy === 'object' 
                            ? task.createdBy.name 
                            : 'User ID: ' + task.createdBy || 'Unknown User'}
                        </Typography>
                        {typeof task.createdBy === 'object' && (
                          <Typography variant="caption" color="text.secondary">
                            {task.createdBy.email || 'No email'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
                
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LabelIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    Labels
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    {task.labels && task.labels.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {task.labels.map((label, index) => (
                          <Chip 
                            key={index} 
                            label={label} 
                            size="small"
                            variant="outlined"
                            onDelete={() => {}}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No labels
                      </Typography>
                    )}
                  </Paper>
                </Box>
                
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    Task Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Created"
                        secondary={format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="Last Updated"
                        secondary={format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Task
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
            disabled={status === 'loading'}
            startIcon={status === 'loading' ? <CircularProgress size={20} /> : null}
          >
            {status === 'loading' ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetail;
