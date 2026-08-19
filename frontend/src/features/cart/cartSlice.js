import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  checkoutStatus: 'idle',
  checkoutError: null,
  lastOrder: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/cart/items', { productId, quantity });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.delete(`/cart/items/${productId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const checkout = createAsyncThunk('cart/checkout', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/checkout');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCheckoutStatus(state) {
      state.checkoutStatus = 'idle';
      state.checkoutError = null;
    },
    clearCartState(state) {
      state.items = [];
      state.lastOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.checkoutStatus = 'loading';
        state.checkoutError = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.checkoutStatus = 'succeeded';
        state.items = [];
        state.lastOrder = action.payload.order;
      })
      .addCase(checkout.rejected, (state, action) => {
        state.checkoutStatus = 'failed';
        state.checkoutError = action.payload || 'No se pudo completar la compra';
      })
      .addMatcher(
        (action) => [fetchCart.pending, addToCart.pending, removeFromCart.pending].some((t) => t.type === action.type),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [fetchCart.fulfilled, addToCart.fulfilled, removeFromCart.fulfilled].some(
            (t) => t.type === action.type
          ),
        (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload.items;
        }
      )
      .addMatcher(
        (action) =>
          [fetchCart.rejected, addToCart.rejected, removeFromCart.rejected].some(
            (t) => t.type === action.type
          ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Error al actualizar el carrito';
        }
      );
  },
});

export const { resetCheckoutStatus, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
