import React, { useState } from 'react';
import { Task, updateTaskStatus } from '../../features/tasks/taskSlice';
import { useAppDispatch } from '../../hooks/reduxHooks';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CardActions,
  Button,
  Divider,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const priorityColors = {
  low: 'info',
  medium: 'warning',
  high: 'error',
} as const;

const statusColors = {
  todo: 'default',
  'in-progress': 'primary',
  completed: 'success',
} as const;

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete }) => {
  const dispatch = useAppDispatch();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      setUpdatingTaskId(taskId);
      await dispatch(updateTaskStatus({ id: taskId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          No tasks found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {tasks.map((task) => (
        <Card key={task._id} variant="outlined">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <div>
                <Typography variant="h6" component="h2" gutterBottom>
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {task.description}
                  </Typography>
                )}
              </div>
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  label={task.priority}
                  color={priorityColors[task.priority]}
                  size="small"
                />
                <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                  <Select
                    value={task.status}
                    onChange={(e: SelectChangeEvent) => 
                      handleStatusChange(task._id, e.target.value as Task['status'])
                    }
                    disabled={updatingTaskId === task._id}
                    size="small"
                    sx={{
                      '& .MuiSelect-select': {
                        py: 0.5,
                        color: (theme: any) => {
                          const color = statusColors[task.status];
                          if (color === 'default') return theme.palette.text.primary;
                          return theme.palette[color]?.main || 'inherit';
                        },
                        fontWeight: 'medium',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {updatingTaskId === task._id && option.value === task.status ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={14} />
                            {option.label}
                          </Box>
                        ) : (
                          option.label
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
              {task.dueDate && (
                <Chip
                  label={`Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`}
                  variant="outlined"
                  size="small"
                />
              )}
              {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
                <Chip
                  label={`Assigned to: ${task.assignedTo.length} user(s)`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </CardContent>
          
          {(onEdit || onDelete) && (
            <>
              <Divider />
              <CardActions>
                {onEdit && (
                  <Button size="small" onClick={() => onEdit(task)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => onDelete(task._id)}
                  >
                    Delete
                  </Button>
                )}
              </CardActions>
            </>
          )}
        </Card>
      ))}
    </Box>
  );
};

export default TaskList;
