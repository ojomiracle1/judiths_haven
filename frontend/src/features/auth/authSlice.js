import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const API_URL = '/api/users';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Validate user from localStorage
const validateUser = (user) => {
  if (!user || !user.token || isTokenExpired(user.token)) {
    localStorage.removeItem('user');
    return null;
  }
  return user;
};

// Helper to normalize user object for isAdmin
const normalizeUser = (user) => {
  if (!user) return user;
  // If both fields exist, trust them. If only one, infer the other.
  let isAdmin = false;
  let role = 'user';
  if (typeof user.isAdmin === 'boolean') {
    isAdmin = user.isAdmin;
    role = user.isAdmin ? 'admin' : 'user';
  }
  if (typeof user.role === 'string') {
    role = user.role;
    isAdmin = user.role === 'admin';
  }
  return { ...user, isAdmin, role };
};

const initialState = {
  user: user ? validateUser(user) : null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
  const response = await api.post('/api/auth/register', userData);
      const normalized = normalizeUser(response.data);
      localStorage.setItem('user', JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
  const response = await api.post('/api/auth/login', userData);
      const token = response.data.token;
      // Use the token directly for the profile request
      const profileRes = await api.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const normalized = normalizeUser({ ...response.data, ...profileRes.data });
      localStorage.setItem('user', JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
});

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const response = await api.put(
        `${API_URL}/profile`,
        userData
      );

      // Update user in localStorage
      const updatedUser = {
        ...thunkAPI.getState().auth.user,
        ...response.data,
      };
      const normalized = normalizeUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(normalized));

      return normalized;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user profile image
export const updateProfileImage = createAsyncThunk(
  'auth/updateProfileImage',
  async (imageUrl, thunkAPI) => {
    try {
      const response = await api.put(`${API_URL}/profile-image`, { imageUrl });
      // Update user in localStorage
      const updatedUser = {
        ...thunkAPI.getState().auth.user,
        profileImage: response.data.profileImage,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { profileImage: response.data.profileImage };
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Request password reset
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, thunkAPI) => {
    try {
      const response = await api.post(`${API_URL}/forgot-password`, { email });
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

// Reset password with token
export const resetPasswordConfirm = createAsyncThunk(
  'auth/resetPasswordConfirm',
  async ({ token, password }, thunkAPI) => {
    try {
      console.log('Sending reset password request with token:', token);
      const response = await api.post(
        `${API_URL}/reset-password`,
        { token, newPassword: password }
      );
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

const authSlice = createSlice({
  name: 'auth',
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
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = '';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateProfileImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        if (state.user) {
          state.user.profileImage = action.payload.profileImage;
        }
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;