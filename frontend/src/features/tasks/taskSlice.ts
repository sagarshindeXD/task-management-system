import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import api from '../../utils/axios'; // Import the configured axios instance
import type { AxiosError } from 'axios'; // Import AxiosError type

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdBy: User | string;  // Can be either User object or string ID
  assignedTo: string[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  total: number;
  filters: {
    status: string[];
    priority: string[];
    search: string;
    sort: string;
    page: number;
    limit: number;
  };
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  status: 'idle',
  error: null,
  total: 0,
  filters: {
    status: [],
    priority: [],
    search: '',
    sort: '-createdAt',
    page: 1,
    limit: 10,
  },
};

interface FetchTasksResponse {
  data: {
    tasks: Task[];
  };
  total: number;
}
// Add new async thunk for fetching assigned tasks
export const fetchAssignedTasks = createAsyncThunk<{ tasks: Task[]; total: number }, void, { state: RootState }>(
  'tasks/fetchAssignedTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: { tasks: Task[]; total: number } }>(
        '/tasks/assigned-to-me'
      );
      return {
        tasks: response.data.data.tasks,
        total: response.data.data.total
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned tasks');
    }
  }
);

export const fetchTasks = createAsyncThunk<FetchTasksResponse, void, { state: RootState }>(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { tasks, auth } = getState() as RootState;
      const { status, priority, search, sort, page, limit } = tasks.filters;
      const userId = auth.user?._id;

      if (!userId) {
        return rejectWithValue('User not authenticated');
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        userId
      });
      
      if (status.length > 0) {
        params.append('status', status.join(','));
      }
      
      if (priority.length > 0) {
        params.append('priority', priority.join(','));
      }
      
      if (search) {
        params.append('search', search);
      }

      const response = await api.get<FetchTasksResponse>(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

interface ApiResponse<T> {
  data: {
    data: {
      task: T;
    };
  };
  message?: string;
}

// Update task status
export const updateTaskStatus = createAsyncThunk<
  Task,
  { id: string; status: Task['status'] },
  { state: RootState; rejectValue: string }
>(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch<{ data: { task: Task } }>(
        `/tasks/${id}/status`,
        { status }
      );
      return response.data.data.task;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task status'
      );
    }
  }
);

export const fetchTaskById = createAsyncThunk<Task, string, { state: RootState; rejectValue: string }>(
  'tasks/fetchTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: { task: Task } }>(`/tasks/${id}`);
      return response.data.data.task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk<Task, Partial<Task>, { state: RootState }>(
  'tasks/createTask',
  async (taskData, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?._id;
      
      if (!userId) {
        return rejectWithValue('User not authenticated');
      }

      // Ensure assignedTo is an array and not empty
      if (!taskData.assignedTo || !Array.isArray(taskData.assignedTo) || taskData.assignedTo.length === 0) {
        return rejectWithValue('At least one assignee is required');
      }

      // Process assignee IDs
      const processedAssignees = taskData.assignedTo.map(id => {
        // Ensure ID is a string and trim any whitespace
        return id.toString().trim();
      });

      // Prepare the task data with processed assignees and createdBy
      const taskPayload = {
        ...taskData,
        assignedTo: processedAssignees,
        createdBy: userId, // Ensure createdBy is set
        status: 'todo' // Ensure status is always set
      };

      console.log('Sending task data to server:', JSON.stringify(taskPayload, null, 2));

      const response = await api.post<{ data: { task: Task } }>('/tasks', taskPayload);
      
      if (!response?.data?.data?.task) {
        console.error('Invalid response format from server:', response?.data);
        throw new Error('Invalid response from server');
      }
      
      console.log('Task created successfully:', response.data.data.task);
      
      // After successful task creation, refresh the task lists
      await Promise.all([
        dispatch(fetchTasks() as any),
        dispatch(fetchAssignedTasks() as any)
      ]);
      
      return response.data.data.task;
      
      // Refresh the task list with current filters
      await dispatch(fetchTasks());
      
      // If the current user is assigned to this task, refresh their assigned tasks too
      const currentUserId = state.auth.user?._id;
      if (currentUserId && processedAssignees.some(id => id === currentUserId)) {
        await dispatch(fetchAssignedTasks() as any);
      }
      
      return response.data.data.task;
    } catch (error: any) {
      console.error('Error in createTask:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        }
      });

      const errorMessage = error.response?.data?.message ||
                         error.response?.data?.error?.message ||
                         error.message ||
                         'Failed to create task';
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    { id, taskData }: { id: string; taskData: Partial<Task> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<{ data: { task: Task } }>(
        `/tasks/${id}`,
        taskData
      );
      return response.data.data.task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.filters.page = 1; // Reset to first page when filters change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add a new reducer to update a specific task
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      } else {
        state.tasks.unshift(action.payload);
        state.total += 1;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.tasks = [];
      state.total = 0;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action: PayloadAction<FetchTasksResponse>) => {
      state.status = 'succeeded';
      // Only update tasks if we have a valid response
      if (action.payload?.data?.tasks) {
        state.tasks = action.payload.data.tasks;
        state.total = action.payload.total || action.payload.data.tasks.length;
      } else {
        console.warn('Unexpected response format:', action.payload);
      }
      state.error = null;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string || 'Failed to fetch tasks';
      state.tasks = [];
      state.total = 0;
    });
    
    // Fetch Task By ID
    builder.addCase(fetchTaskById.pending, (state) => {
      state.status = 'loading';
      state.currentTask = null;
      state.error = null;
    });
    builder.addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<Task>) => {
      state.status = 'succeeded';
      state.currentTask = action.payload;
      state.error = null;
    });
    builder.addCase(fetchTaskById.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string || 'Failed to fetch task';
      state.currentTask = null;
    });
    
    // Create Task
    builder.addCase(createTask.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        // Add the new task to the beginning of the list if it's not already there
        const existingIndex = state.tasks.findIndex(t => t._id === action.payload._id);
        if (existingIndex === -1) {
          state.tasks.unshift(action.payload);
          state.total += 1;
        } else {
          // Update existing task if it already exists
          state.tasks[existingIndex] = action.payload;
        }
        state.error = null;
        state.status = 'succeeded';
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to create task';
        // Reset status to idle after a short delay to clear the error state
        setTimeout(() => {
          state.status = 'idle';
        }, 2000);
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.total -= 1;
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
      })
      // Update Task Status
      .addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<Task>) => {
        const updatedTask = action.payload;
        const existingTask = state.tasks.find(task => task._id === updatedTask._id);
        if (existingTask) {
          existingTask.status = updatedTask.status;
        }
        if (state.currentTask?._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
      });
  },
});

export const { 
  setFilters, 
  resetFilters, 
  clearCurrentTask, 
  clearError, 
  updateTaskInList 
} = taskSlice.actions;

export const selectAllTasks = (state: RootState) => state.tasks.tasks;
export const selectCurrentTask = (state: RootState) => state.tasks.currentTask;
export const selectTaskStatus = (state: RootState) => state.tasks.status;
export const selectTaskError = (state: RootState) => state.tasks.error;
export const selectTaskFilters = (state: RootState) => state.tasks.filters;
export const selectTotalTasks = (state: RootState) => state.tasks.total;

export default taskSlice.reducer;
