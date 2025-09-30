import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { store } from '../store/store';
import { RootState } from '../store/store';
import { 
  fetchTasks, 
  fetchAssignedTasks,
  deleteTask,
  selectAllTasks, 
  selectTaskFilters, 
  selectTaskStatus,
  selectTotalTasks,
  selectTaskError,
  setFilters,
} from '../features/tasks/taskSlice';
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
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
  ListItemButton,
  useTheme,
  Pagination,
  Alert,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterListIcon, 
  Sort as SortIcon, 
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CompletedIcon,
  PendingActions as InProgressIcon,
  AssignmentLate as TodoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const statusOptions = [
  { value: 'todo', label: 'To Do', icon: <TodoIcon fontSize="small" /> },
  { value: 'in-progress', label: 'In Progress', icon: <InProgressIcon fontSize="small" /> },
  { value: 'completed', label: 'Completed', icon: <CompletedIcon fontSize="small" /> },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: '-title', label: 'Title (Z-A)' },
  { value: 'dueDate', label: 'Due Date (Earliest)' },
  { value: '-dueDate', label: 'Due Date (Latest)' },
];

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get tasks and state from Redux
  const tasks = useAppSelector(selectAllTasks);
  const filters = useAppSelector(selectTaskFilters);
  const status = useAppSelector(selectTaskStatus);
  const totalTasks = useAppSelector(selectTotalTasks);
  const error = useAppSelector(selectTaskError);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const taskMenuOpen = Boolean(taskMenuAnchor);
  
  // Update filters when URL params change
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const newFilters = { ...filters };
    
    if (params.status) {
      newFilters.status = params.status.split(',');
    } else {
      newFilters.status = [];
    }
    
    if (params.priority) {
      newFilters.priority = params.priority.split(',');
    } else {
      newFilters.priority = [];
    }
    
    if (params.search) {
      newFilters.search = params.search;
      setSearchQuery(params.search);
    } else {
      newFilters.search = '';
      setSearchQuery('');
    }
    
    if (params.sort) {
      newFilters.sort = params.sort;
    }
    
    if (params.page) {
      newFilters.page = parseInt(params.page, 10);
    }
    
    dispatch(setFilters(newFilters));
  }, [searchParams, dispatch]);
  
  // Fetch tasks when component mounts and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch the main task list
        await dispatch(fetchTasks() as any);
        
        // Also fetch assigned tasks if the user is logged in
        const state = store.getState() as RootState;
        if (state.auth.isAuthenticated) {
          await dispatch(fetchAssignedTasks() as any);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchData();
  }, [filters, dispatch]);
  
  // Handle filter changes
  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const statuses = typeof value === 'string' ? value.split(',') : value;
    
    const newParams = new URLSearchParams(searchParams);
    if (statuses.length > 0) {
      newParams.set('status', statuses.join(','));
    } else {
      newParams.delete('status');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    
    handleClose();
  };
  
  const handlePriorityChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const priorities = typeof value === 'string' ? value.split(',') : value;
    
    const newParams = new URLSearchParams(searchParams);
    if (priorities.length > 0) {
      newParams.set('priority', priorities.join(','));
    } else {
      newParams.delete('priority');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    
    handleClose();
  };
  
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    setSearchParams(newParams);
    
    handleClose();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    } else {
      newParams.delete('search');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleTaskMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setSelectedTask(taskId);
    setTaskMenuAnchor(event.currentTarget);
  };
  
  const handleTaskMenuClose = () => {
    setTaskMenuAnchor(null);
    setSelectedTask(null);
  };
  
  const handleEditTask = () => {
    if (selectedTask) {
      navigate(`/tasks/${selectedTask}/edit`);
      handleTaskMenuClose();
    }
  };
  
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await dispatch(deleteTask(selectedTask)).unwrap();
        // Refresh the tasks list after deletion
        dispatch(fetchTasks());
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    
    handleTaskMenuClose();
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
  
  const getSortLabel = (sortValue: string) => {
    const option = sortOptions.find(opt => opt.value === sortValue);
    return option ? option.label : sortValue;
  };
  
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
          My Tasks
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
            sx={{ textTransform: 'none' }}
          >
            New Task
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleClick}
            sx={{ textTransform: 'none' }}
            aria-controls={open ? 'filters-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            Filters
          </Button>
          
          <Menu
            id="filters-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'filters-button',
            }}
            PaperProps={{
              style: {
                width: 300,
                padding: '16px',
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Filter Tasks
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                Status
              </Typography>
              <Select
                multiple
                value={filters.status}
                onChange={handleStatusChange}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={getStatusLabel(value)} 
                        size="small"
                        sx={{ height: 24 }}
                      />
                    ))}
                  </Box>
                )}
                sx={{ '& .MuiSelect-select': { py: 1 } }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {option.icon}
                    </ListItemIcon>
                    <ListItemText primary={option.label} />
                    <Checkbox
                      checked={filters.status.includes(option.value)}
                      size="small"
                      sx={{ p: 0, ml: 1 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                Priority
              </Typography>
              <Select
                multiple
                value={filters.priority}
                onChange={handlePriorityChange}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        sx={{ height: 24 }}
                      />
                    ))}
                  </Box>
                )}
                sx={{ '& .MuiSelect-select': { py: 1 } }}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box 
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getPriorityColor(option.value),
                        mr: 1.5,
                      }}
                    />
                    <ListItemText primary={option.label} />
                    <Checkbox
                      checked={filters.priority.includes(option.value)}
                      size="small"
                      sx={{ p: 0, ml: 1 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Sort By
            </Typography>
            
            <List dense disablePadding>
              {sortOptions.map((option) => (
                <ListItem 
                  key={option.value} 
                  disablePadding
                  onClick={() => handleSortChange(option.value)}
                  sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemButton dense>
                    <ListItemText primary={option.label} />
                    {filters.sort === option.value && (
                      <ArrowUpwardIcon color="primary" fontSize="small" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Menu>
        </Box>
      </Box>
      
      <Paper 
        component="form" 
        onSubmit={handleSearch}
        sx={{ 
          p: 2, 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 },
          }}
          size="small"
        />
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ ml: 2, textTransform: 'none', px: 3, borderRadius: 2 }}
        >
          Search
        </Button>
      </Paper>
      
      {filters.status.length > 0 || filters.priority.length > 0 || filters.search ? (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.status.map((status) => (
            <Chip
              key={`status-${status}`}
              label={`Status: ${getStatusLabel(status)}`}
              onDelete={() => {
                const newStatus = filters.status.filter(s => s !== status);
                const newParams = new URLSearchParams(searchParams);
                if (newStatus.length > 0) {
                  newParams.set('status', newStatus.join(','));
                } else {
                  newParams.delete('status');
                }
                setSearchParams(newParams);
              }}
              size="small"
              variant="outlined"
            />
          ))}
          
          {filters.priority.map((priority) => (
            <Chip
              key={`priority-${priority}`}
              label={`Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`}
              onDelete={() => {
                const newPriority = filters.priority.filter(p => p !== priority);
                const newParams = new URLSearchParams(searchParams);
                if (newPriority.length > 0) {
                  newParams.set('priority', newPriority.join(','));
                } else {
                  newParams.delete('priority');
                }
                setSearchParams(newParams);
              }}
              size="small"
              variant="outlined"
            />
          ))}
          
          {filters.search && (
            <Chip
              label={`Search: "${filters.search}"`}
              onDelete={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('search');
                setSearchParams(newParams);
                setSearchQuery('');
              }}
              size="small"
              variant="outlined"
            />
          )}
          
          <Button 
            size="small" 
            onClick={() => {
              setSearchParams({});
              setSearchQuery('');
            }}
            sx={{ ml: 1 }}
          >
            Clear all
          </Button>
        </Box>
      ) : null}
      
      {status === 'loading' && tasks.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : tasks.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {filters.status.length > 0 || filters.priority.length > 0 || filters.search
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating a new task.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tasks/new')}
            sx={{ mt: 2, textTransform: 'none' }}
          >
            Create Task
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
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
                        onClick={(e) => handleTaskMenuOpen(e, task._id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                      {getStatusIcon(task.status)}
                    </ListItemIcon>
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
                            
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                bgcolor: `${getPriorityColor(task.priority)}20`,
                                color: getPriorityColor(task.priority),
                                border: `1px solid ${getPriorityColor(task.priority)}`,
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
                            
                            {task.labels && task.labels.length > 0 && (
                              <Box display="flex" gap={0.5} flexWrap="wrap">
                                {task.labels.slice(0, 2).map((label, idx) => (
                                  <Chip
                                    key={idx}
                                    label={label}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      bgcolor: 'action.selected',
                                    }}
                                  />
                                ))}
                                {task.labels.length > 2 && (
                                  <Tooltip title={task.labels.slice(2).join(', ')}>
                                    <Chip
                                      label={`+${task.labels.length - 2}`}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        bgcolor: 'action.selected',
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
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
                            
                            {task.updatedAt !== task.createdAt && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1, display: 'flex', alignItems: 'center' }}
                              >
                                • Updated: {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                              </Typography>
                            )}
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
            
            <Menu
              anchorEl={taskMenuAnchor}
              open={taskMenuOpen}
              onClose={handleTaskMenuClose}
              onClick={handleTaskMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleEditTask}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Paper>
          
          {totalTasks > filters.limit && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={Math.ceil(totalTasks / filters.limit)}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Tasks;
