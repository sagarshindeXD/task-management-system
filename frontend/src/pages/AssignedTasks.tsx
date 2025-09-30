import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAssignedTasks } from '../features/tasks/taskSlice';
import TaskList from '../components/tasks/TaskList';
import { Container, Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';

const AssignedTasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, status, error, total } = useAppSelector((state) => ({
    tasks: state.tasks.tasks,
    status: state.tasks.status,
    error: state.tasks.error,
    total: state.tasks.total
  }));

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAssignedTasks());
    }
  }, [dispatch, status]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Assigned Tasks
        </Typography>
        
        {status === 'loading' ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <>
            {tasks.length === 0 ? (
              <Typography variant="body1" color="textSecondary">
                No tasks assigned to you yet.
              </Typography>
            ) : (
              <TaskList tasks={tasks} />
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AssignedTasks;
