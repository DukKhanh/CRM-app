import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  customer_id: string;
  createdAt: string;
  customer?: {
    name: string;
  };
}

interface TaskState {
  list: Task[];
  loading: boolean;
}

const initialState: TaskState = {
  list: [],
  loading: false,
};

export const fetchTasks = createAsyncThunk('task/fetchAll', async () => {
  const response = await axiosClient.get('/tasks');
  return response.data;
});

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default taskSlice.reducer;