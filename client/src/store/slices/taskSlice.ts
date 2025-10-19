import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import taskService, {
  Task,
  TaskListResponse,
  TaskQueryParams,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStats,
} from '../../services/taskService';

/**
 * 任务状态接口
 */
export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  stats: TaskStats | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

/**
 * 初始状态
 */
const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  stats: null,
  meta: null,
  loading: false,
  error: null,
};

/**
 * 获取任务列表
 */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: TaskQueryParams = {}, { rejectWithValue }) => {
    try {
      const data = await taskService.getTasks(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务列表失败');
    }
  }
);

/**
 * 获取任务详情
 */
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const data = await taskService.getTaskById(taskId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务详情失败');
    }
  }
);

/**
 * 创建任务
 */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskDto, { rejectWithValue }) => {
    try {
      const data = await taskService.createTask(taskData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建任务失败');
    }
  }
);

/**
 * 更新任务
 */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: UpdateTaskDto }, { rejectWithValue }) => {
    try {
      const result = await taskService.updateTask(id, data);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新任务失败');
    }
  }
);

/**
 * 删除任务
 */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '删除任务失败');
    }
  }
);

/**
 * 获取任务统计
 */
export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await taskService.getTaskStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取任务统计失败');
    }
  }
);

/**
 * 任务 Slice
 */
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
      state.currentTask = null;
      state.meta = null;
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    // 获取任务列表
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<TaskListResponse>) => {
        state.loading = false;
        state.tasks = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取任务详情
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建任务
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新任务
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除任务
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取任务统计
    builder
      .addCase(fetchTaskStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action: PayloadAction<TaskStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTasks, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;

