import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  orders: [],
  order: null,
  isLoading: false,
  isError: false,
  message: '',
  page: 1,
  pages: 1,
};

// Create order
export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData, thunkAPI) => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all orders (admin)
export const getOrders = createAsyncThunk(
  'order/getAll',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const response = await api.get(`/api/orders?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my orders (user)
export const getMyOrders = createAsyncThunk(
  'order/getMyOrders',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/api/orders/myorders');
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  'order/getById',
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update order to paid
export const updateOrderToPaid = createAsyncThunk(
  'order/updateToPaid',
  async ({ id, paymentResult }, thunkAPI) => {
    try {
      const response = await api.put(`/api/orders/${id}/pay`, paymentResult);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update order to delivered
export const updateOrderToDelivered = createAsyncThunk(
  'order/updateToDelivered',
  async (id, thunkAPI) => {
    try {
      const response = await api.put(`/api/orders/${id}/deliver`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Unmark order as delivered (admin)
export const unmarkOrderAsDelivered = createAsyncThunk(
  'order/unmarkAsDelivered',
  async (id, thunkAPI) => {
    try {
      const response = await api.put(`/api/orders/${id}/unmark-delivered`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update order status (admin only)
export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({ id, status, trackingNumber, notes }, thunkAPI) => {
    try {
      const response = await api.put(
        `/api/orders/${id}/status`,
        { status, trackingNumber, notes }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
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
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get all orders
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.orders = [];
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders || [];
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.orders = [];
      })
      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
        state.orders = [];
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.orders = [];
      })
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update order to paid
      .addCase(updateOrderToPaid.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderToPaid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateOrderToPaid.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update order to delivered
      .addCase(updateOrderToDelivered.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderToDelivered.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateOrderToDelivered.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Unmark order as delivered
      .addCase(unmarkOrderAsDelivered.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unmarkOrderAsDelivered.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(unmarkOrderAsDelivered.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = orderSlice.actions;
export default orderSlice.reducer;