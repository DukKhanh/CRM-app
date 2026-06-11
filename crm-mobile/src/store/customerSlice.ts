import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

// Gọi API lấy danh sách KH từ Backend
export const fetchCustomers = createAsyncThunk('customer/fetchAll', async () => {
  const response = await axiosClient.get('/customers');
  return response.data;
});

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // Lưu dữ liệu tải về vào biến list
      })
      .addCase(fetchCustomers.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default customerSlice.reducer;
