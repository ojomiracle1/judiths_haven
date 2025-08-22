import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  categories: [],
  category: null,
  isLoading: false,
  isError: false,
  message: '',
};

// Helper to get token from state/localStorage
const getToken = (thunkAPI) => {
  const state = thunkAPI.getState();
  return state.auth?.user?.token || JSON.parse(localStorage.getItem('user'))?.token;
};

// Get all categories
export const getCategories = createAsyncThunk(
  'category/getCategories',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/api/categories');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single category
export const getCategoryById = createAsyncThunk(
  'category/getCategoryById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create category
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const response = await api.post('/api/categories', categoryData, {
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

// Update category
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, categoryData }, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const response = await api.put(`/api/categories/${id}`, categoryData, {
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

// Delete category
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      await api.delete(`/api/categories/${id}`, {
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

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all categories
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get single category
      .addCase(getCategoryById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.category = action.payload;
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        );
        state.category = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = categorySlice.actions;
export default categorySlice.reducer;