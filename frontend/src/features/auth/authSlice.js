import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

const storedUser = localStorage.getItem('user');

const initialState = {
  token: localStorage.getItem('token') || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/register', { name, email, password });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => [login.pending.type, register.pending.type].includes(action.type),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [login.fulfilled.type, register.fulfilled.type].includes(action.type),
        (state, action) => {
          state.status = 'succeeded';
          state.token = action.payload.token;
          state.user = action.payload.user;
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      )
      .addMatcher(
        (action) => [login.rejected.type, register.rejected.type].includes(action.type),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'No se pudo autenticar';
        }
      );
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
