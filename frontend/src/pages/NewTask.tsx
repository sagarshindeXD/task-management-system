import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { RootState } from '../store/store';
import { User } from '../features/users/userSlice';
import { createTask } from '../features/tasks/taskSlice';
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
const NewTask: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { users = [], status: userStatus } = useAppSelector((state: RootState) => state.users);
  
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
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values: TaskFormValues, { setSubmitting, setFieldError }) => {
      try {
        setIsSubmitting(true);
        
        // Ensure assignee is provided
        if (!values.assignee) {
          setFieldError('assignee', 'Please select an assignee');
          return;
        }

        // Ensure the assignee ID is properly formatted as a MongoDB ObjectId
        const assigneeId = values.assignee.trim();
        
        // Log the users for debugging
        console.log('All available users:', JSON.stringify(users, null, 2));
        console.log('Selected assignee ID (raw):', assigneeId, 'Type:', typeof assigneeId);
        
        // Log each user's ID for comparison
        console.log('User IDs in the system:');
        users.forEach((user, index) => {
          console.log(`User ${index + 1}:`, {
            _id: user._id,
            name: user.name,
            email: user.email,
            'Type of _id': typeof user._id,
            'Exact match with selected?': user._id === assigneeId ? 'YES' : 'NO',
            'Trimmed match?': user._id.trim() === assigneeId.trim() ? 'YES' : 'NO'
          });
        });
        
        // Verify the user exists in the local state with loose comparison
        const selectedUser = users.find(user => user._id.toString() === assigneeId.toString().trim());
        if (!selectedUser) {
          console.error('Selected user not found in local state');
          console.error('Available user IDs:', users.map(u => u._id));
          setFieldError('assignee', 'Selected user is not valid. Please select a user from the list.');
          return;
        }
        
        console.log('Selected user found:', selectedUser);
        
        const taskData = {
          title: values.title,
          description: values.description || undefined,
          priority: values.priority,
          status: 'todo' as const,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
          assignedTo: [assigneeId],
        };
        
        console.log('Sending task data:', taskData);

        await dispatch(createTask(taskData)).unwrap();
        navigate('/tasks');
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
          
          {formik.errors.submit && (
            <Typography color="error" sx={{ mt: 2 }}>
              {formik.errors.submit}
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
