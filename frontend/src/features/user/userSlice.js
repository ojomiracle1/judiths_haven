import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  users: [],
  user: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Helper to get token from state/localStorage
const getToken = (thunkAPI) => {
  const state = thunkAPI.getState();
  return state.auth?.user?.token || JSON.parse(localStorage.getItem('user'))?.token;
};

// Get all users
export const getUsers = createAsyncThunk(
  'user/getUsers',
  async (_, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
  const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const response = await api.get(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  'user/create',
  async (userData, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
  const response = await api.post('/users', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const response = await api.put(`/api/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      await api.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Ban or unban user
export const banUser = createAsyncThunk(
  'user/banUser',
  async (id, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const response = await api.patch(`/api/users/${id}/ban`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { id, isBanned: response.data.message === 'User banned' };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin reset user password
export const resetUserPassword = createAsyncThunk(
  'user/resetUserPassword',
  async ({ id, newPassword }, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const response = await api.patch(
        `/api/users/${id}/reset-password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { id, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.users = [];
      })
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Ban or unban user
      .addCase(banUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        const { id, isBanned } = action.payload;
        state.users = state.users.map((u) =>
          u._id === id ? { ...u, isBanned } : u
        );
        state.isSuccess = true;
      })
      .addCase(banUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Admin reset user password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = userSlice.actions;
export default userSlice.reducer;