import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/orders');
    return data.items;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudo cargar el historial';
      });
  },
});

export default ordersSlice.reducer;
