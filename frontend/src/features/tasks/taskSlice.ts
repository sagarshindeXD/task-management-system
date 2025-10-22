import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import api from '../../utils/axios'; // Import the configured axios instance
import type { AxiosError } from 'axios'; // Import AxiosError type

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignDate?: string; // When the task was assigned
  department?: string; // Department field
  createdBy: User | string;  // Who created the task
  assignedBy: User | string; // Who assigned the task (for admin view)
  assignedTo: (User | string)[];
  client: string | Client;
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
  myCompletedTasks: Task[];
  teamTasks: Task[];
  teamCompletedTasks: Task[];
  dashboardMetrics: {
    users: Array<{
      _id: string;
      name: string;
      tasksAssigned: number;
      doneTasks: number;
      pendingTasks: number;
      delayedTasks: number;
      inReviewTasks: number;
      workingTasks: number;
      performance: number;
    }>;
    departments: Array<{
      name: string;
      tasksAssigned: number;
      doneTasks: number;
      pendingTasks: number;
      delayedTasks: number;
      inReviewTasks: number;
      workingTasks: number;
    }>;
  } | null;
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
  myCompletedTasks: [],
  teamTasks: [],
  teamCompletedTasks: [],
  dashboardMetrics: null,
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

// Add new async thunk for fetching dashboard metrics for admin
// Note: This endpoint may not exist on backend yet
export const fetchDashboardMetrics = createAsyncThunk(
  'tasks/fetchDashboardMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{
        users: Array<{
          _id: string;
          name: string;
          tasksAssigned: number;
          doneTasks: number;
          pendingTasks: number;
          delayedTasks: number;
          inReviewTasks: number;
          workingTasks: number;
          performance: number;
        }>;
        departments: Array<{
          name: string;
          tasksAssigned: number;
          doneTasks: number;
          pendingTasks: number;
          delayedTasks: number;
          inReviewTasks: number;
          workingTasks: number;
        }>;
      }>('/tasks/dashboard-metrics');
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist, return null instead of rejecting
      if (error.response?.status === 404 || error.response?.status === 500) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

// Add new async thunk for fetching completed tasks assigned to the current user
// Note: This endpoint may not exist on backend yet
export const fetchMyCompletedTasks = createAsyncThunk<{ tasks: Task[]; total: number }, void, { state: RootState }>(
  'tasks/fetchMyCompletedTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: { tasks: Task[]; total: number } }>(
        '/tasks/my-completed'
      );
      return {
        tasks: response.data.data.tasks,
        total: response.data.data.total
      };
    } catch (error: any) {
      // If endpoint doesn't exist, return empty data instead of rejecting
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { tasks: [], total: 0 };
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch completed tasks');
    }
  }
);

// Add new async thunk for fetching all team tasks (everyone's tasks)
// Note: This endpoint may not exist on backend yet
export const fetchTeamTasks = createAsyncThunk<{ tasks: Task[]; total: number }, void, { state: RootState }>(
  'tasks/fetchTeamTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: { tasks: Task[]; total: number } }>(
        '/tasks/team-tasks'
      );
      return {
        tasks: response.data.data.tasks,
        total: response.data.data.total
      };
    } catch (error: any) {
      // If endpoint doesn't exist, return empty data instead of rejecting
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { tasks: [], total: 0 };
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team tasks');
    }
  }
);

// Add new async thunk for fetching team completed tasks
// Note: This endpoint may not exist on backend yet
export const fetchTeamCompletedTasks = createAsyncThunk<{ tasks: Task[]; total: number }, void, { state: RootState }>(
  'tasks/fetchTeamCompletedTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: { tasks: Task[]; total: number } }>(
        '/tasks/team-completed'
      );
      return {
        tasks: response.data.data.tasks,
        total: response.data.data.total
      };
    } catch (error: any) {
      // If endpoint doesn't exist, return empty data instead of rejecting
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { tasks: [], total: 0 };
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team completed tasks');
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
  async ({ id, status }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await api.patch<{ data: { task: Task } }>(
        `/tasks/${id}/status`,
        { status }
      );
      const updatedTask = response.data.data.task;

      // Update the task in the current state
      dispatch(updateTaskInList(updatedTask));

      // Refresh dashboard metrics for admin users after status update
      const state = getState() as RootState;
      const currentUser = state.auth.user;

      if (currentUser?.role === 'admin') {
        // Refresh dashboard metrics asynchronously
        dispatch(fetchDashboardMetrics() as any);
      }

      return updatedTask;
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
        assignedBy: userId, // Ensure assignedBy is set to the logged-in user
        status: 'todo' // Ensure status is always set
      };

      // console.log('Sending task data to server:', JSON.stringify(taskPayload, null, 2));

      const response = await api.post<{ data: { task: Task } }>('/tasks', taskPayload);
      
      if (!response?.data?.data?.task) {
        // console.error('Invalid response format from server:', response?.data);
        throw new Error('Invalid response from server');
      }
      
      // console.log('Task created successfully:', response.data.data.task);
      
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
      // console.error('Error in createTask:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   status: error.response?.status,
      //   config: {
      //     url: error.config?.url,
      //     method: error.config?.method,
      //     data: error.config?.data,
      //   }
      // });

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
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const response = await api.patch<{ data: { task: Task } }>(
        `/tasks/${id}`,
        taskData
      );
      const updatedTask = response.data.data.task;

      // Update the task in the current state
      dispatch(updateTaskInList(updatedTask));

      // Refresh dashboard metrics for admin users after task update
      const state = getState() as RootState;
      const currentUser = state.auth.user;

      if (currentUser?.role === 'admin') {
        // Refresh dashboard metrics asynchronously
        dispatch(fetchDashboardMetrics() as any);
      }

      return updatedTask;
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
        // console.warn('Unexpected response format:', action.payload);
      }
      state.error = null;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string || 'Failed to fetch tasks';
      state.tasks = [];
      state.total = 0;
    });

    // Fetch Assigned Tasks
    builder.addCase(fetchAssignedTasks.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchAssignedTasks.fulfilled, (state, action) => {
      state.status = 'succeeded';
      // Match what the async thunk actually returns: { tasks: Task[]; total: number }
      state.tasks = action.payload.tasks;
      state.total = action.payload.total;
      state.error = null;
    });
    builder.addCase(fetchAssignedTasks.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
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
      // Reset status after a delay to clear error state
      setTimeout(() => {
        state.status = 'idle';
      }, 3000);
    });

    // Update Task Status - Enhanced to handle list movement
    builder.addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<Task>) => {
      const updatedTask = action.payload;
      const index = state.tasks.findIndex(task => task._id === updatedTask._id);

      if (index !== -1) {
        // If task is completed, remove from assigned tasks and add to completed tasks
        if (updatedTask.status === 'completed') {
          // Remove from assigned tasks list
          state.tasks.splice(index, 1);
          state.total -= 1;

          // Add to completed tasks list if not already there
          const completedIndex = state.myCompletedTasks.findIndex(task => task._id === updatedTask._id);
          if (completedIndex === -1) {
            state.myCompletedTasks.unshift(updatedTask);
          } else {
            state.myCompletedTasks[completedIndex] = updatedTask;
          }
        } else {
          // For non-completed tasks, just update in place
          state.tasks[index] = updatedTask;
        }
      } else {
        // Task not in assigned tasks list, check if it's in completed tasks and needs to move back
        if (updatedTask.status !== 'completed') {
          const completedIndex = state.myCompletedTasks.findIndex(task => task._id === updatedTask._id);
          if (completedIndex !== -1) {
            // Remove from completed tasks
            state.myCompletedTasks.splice(completedIndex, 1);

            // Add to assigned tasks
            state.tasks.unshift(updatedTask);
            state.total += 1;
          }
        }
      }

      if (state.currentTask?._id === updatedTask._id) {
        state.currentTask = updatedTask;
      }
      state.error = null;
    });

    builder.addCase(updateTaskStatus.rejected, (state, action) => {
      state.error = action.payload as string || 'Failed to update task status';
    });

    // Update Task
    builder.addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.currentTask?._id === action.payload._id) {
        state.currentTask = action.payload;
      }
      state.error = null;
    });

    builder.addCase(updateTask.rejected, (state, action) => {
      state.error = action.payload as string || 'Failed to update task';
    });
    // Fetch My Completed Tasks
    builder.addCase(fetchMyCompletedTasks.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchMyCompletedTasks.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.myCompletedTasks = action.payload.tasks;
      state.error = null;
    });
    builder.addCase(fetchMyCompletedTasks.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
      state.myCompletedTasks = [];
    });

    // Fetch Team Tasks
    builder.addCase(fetchTeamTasks.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchTeamTasks.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.teamTasks = action.payload.tasks;
      state.error = null;
    });
    builder.addCase(fetchTeamTasks.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
      state.teamTasks = [];
    });

    // Fetch Team Completed Tasks
    builder.addCase(fetchTeamCompletedTasks.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchTeamCompletedTasks.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.teamCompletedTasks = action.payload.tasks;
      state.error = null;
    });
    builder.addCase(fetchTeamCompletedTasks.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
      state.teamCompletedTasks = [];
    });

    // Fetch Dashboard Metrics
    builder.addCase(fetchDashboardMetrics.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.dashboardMetrics = action.payload;
      state.error = null;
    });
    builder.addCase(fetchDashboardMetrics.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
      state.dashboardMetrics = null;
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
export const selectTaskStatus = (state: RootState) => state.tasks.status;
export const selectTaskError = (state: RootState) => state.tasks.error;
export const selectTaskFilters = (state: RootState) => state.tasks.filters;
export const selectTotalTasks = (state: RootState) => state.tasks.total;
export const selectCurrentTask = (state: RootState) => state.tasks.currentTask;
export const selectMyCompletedTasks = (state: RootState) => state.tasks.myCompletedTasks;
export const selectTeamTasks = (state: RootState) => state.tasks.teamTasks;
export const selectTeamCompletedTasks = (state: RootState) => state.tasks.teamCompletedTasks;
export const selectDashboardMetrics = (state: RootState) => state.tasks.dashboardMetrics;

export default taskSlice.reducer;
