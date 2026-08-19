import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

const initialState = {
  items: [],
  category: '',
  nextCursor: null,
  cursorHistory: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async ({ category, cursor, direction } = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/products', {
        params: { category: category || undefined, cursor: cursor || undefined, limit: 8 },
      });
      return { ...data, cursor: cursor || null, direction };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory(state, action) {
      state.category = action.payload;
      state.cursorHistory = [];
      state.nextCursor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.nextCursor = action.payload.nextCursor;
        if (action.payload.direction === 'next' && action.payload.cursor) {
          state.cursorHistory.push(action.payload.cursor);
        } else if (action.payload.direction === 'prev') {
          state.cursorHistory.pop();
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'No se pudieron cargar los productos';
      });
  },
});

export const { setCategory } = productsSlice.actions;
export default productsSlice.reducer;
