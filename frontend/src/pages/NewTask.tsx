import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { RootState } from '../store/store';
import { User } from '../features/users/userSlice';
import { createTask, fetchTasks, fetchAssignedTasks } from '../features/tasks/taskSlice';
import { fetchUsers } from '../features/users/userSlice';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  FormHelperText,
  Container,
  CircularProgress,
} from '@mui/material';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title cannot be more than 100 characters'),
  description: Yup.string()
    .max(1000, 'Description cannot be more than 1000 characters'),
  priority: Yup.string()
    .oneOf(['low', 'medium', 'high'], 'Invalid priority')
    .required('Priority is required'),
  dueDate: Yup.date()
    .min(new Date(), 'Due date must be in the future')
    .nullable()
    .required('Due date is required'),
  assignee: Yup.string()
    .required('Please select an assignee'),
});
interface TaskFormValues {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
  submit?: string;
}
const NewTask = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; error: string | null }>({ success: false, error: null });
  const { users = [], status: userStatus } = useAppSelector((state: RootState) => state.users);
  const taskStatus = useAppSelector((state: RootState) => state.tasks.status);
  const taskError = useAppSelector((state: RootState) => state.tasks.error);
  
  // Debugging
  useEffect(() => {
    console.log('Users in store:', users);
    console.log('User status:', userStatus);
  }, [users, userStatus]);
  
  // Fetch users when component mounts
  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(fetchUsers());
    }
  }, [dispatch, userStatus]);

  const formik = useFormik<TaskFormValues>({
    initialValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignee: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setFieldError, resetForm }) => {
      try {
        setIsSubmitting(true);
        setStatus({ success: false, error: null });
        
        // Ensure assignee is provided
        if (!values.assignee) {
          const errorMsg = 'Please select an assignee';
          setFieldError('assignee', errorMsg);
          setStatus({ success: false, error: errorMsg });
          return;
        }
        
        // Reset any previous errors
        setFieldError('submit', '');

        // Ensure the assignee ID is properly formatted as a MongoDB ObjectId
        const assigneeId = values.assignee.trim();
        
        // Verify the user exists in the local state with loose comparison
        const selectedUser = users.find(user => user._id.toString() === assigneeId.toString().trim());
        if (!selectedUser) {
          console.error('Selected user not found in local state');
          console.error('Available user IDs:', users.map(u => u._id));
          setFieldError('assignee', 'Selected user is not valid. Please select a user from the list.');
          return;
        }
        
        const taskData = {
          title: values.title,
          description: values.description || undefined,
          priority: values.priority,
          status: 'todo' as const,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
          assignedTo: [assigneeId],
        };
        
        console.log('Sending task data:', taskData);

        const result = await dispatch(createTask(taskData) as any);
        
        if (createTask.fulfilled.match(result)) {
          // Task created successfully
          setStatus({ success: true, error: null });
          
          // Refresh the task lists
          await Promise.all([
            dispatch(fetchTasks() as any),
            dispatch(fetchAssignedTasks() as any)
          ]);
          
          // Show success message briefly before navigating
          setTimeout(() => {
            resetForm();
            setSubmitting(false);
            // Navigate to tasks list with a refresh flag
            navigate('/tasks', { 
              replace: true,
              state: { refresh: true }
            });
          }, 1000);
        } else if (createTask.rejected.match(result)) {
          // Handle rejection
          const errorMsg = (result.payload as string) || 'Failed to create task';
          setFieldError('submit', errorMsg);
          setStatus({ success: false, error: errorMsg });
          console.error('Task creation failed:', result.error);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to create task';
        setFieldError('submit', errorMessage);
        console.error('Task creation error:', error);
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  // Show success message if task was created successfully
  if (status?.success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom color="success.main">
            Task Created Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Redirecting to tasks list...
          </Typography>
          <CircularProgress color="success" />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Task
        </Typography>
        
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            margin="normal"
          />
          
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            margin="normal"
          />
          
          <FormControl 
            fullWidth 
            margin="normal"
            error={formik.touched.priority && Boolean(formik.errors.priority)}
          >
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={formik.values.priority}
              label="Priority"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
            {formik.touched.priority && formik.errors.priority && (
              <FormHelperText>{formik.errors.priority}</FormHelperText>
            )}
          </FormControl>
          
          <TextField
            fullWidth
            id="dueDate"
            name="dueDate"
            label="Due Date"
            type="datetime-local"
            value={formik.values.dueDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
            helperText={formik.touched.dueDate && formik.errors.dueDate}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          
          <FormControl 
            fullWidth 
            margin="normal"
            error={formik.touched.assignee && Boolean(formik.errors.assignee)}
          >
            <InputLabel id="assignee-label">Assignee</InputLabel>
            <Select
              labelId="assignee-label"
              id="assignee"
              name="assignee"
              value={formik.values.assignee}
              label="Assignee"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="">
                <em>Select an assignee</em>
              </MenuItem>
              {users.map((user: User) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
            {formik.touched.assignee && formik.errors.assignee && (
              <FormHelperText>{formik.errors.assignee}</FormHelperText>
            )}
          </FormControl>
          
          {(formik.errors.submit || status?.error) && (
            <Typography color="error" sx={{ mt: 2 }}>
              {formik.errors.submit || status?.error}
            </Typography>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/tasks')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewTask;
