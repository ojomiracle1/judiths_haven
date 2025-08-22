import axios from '../../utils/axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, thunkAPI) => {
  const { data } = await axios.get('/api/wishlist');
  return data.products || [];
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId, thunkAPI) => {
  const { data } = await axios.post('/api/wishlist/add', { productId });
  return data.products;
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, thunkAPI) => {
  const { data } = await axios.post('/api/wishlist/remove', { productId });
  return data.products;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state) => { state.isLoading = false; })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.products = action.payload;
      });
  },
});

export default wishlistSlice.reducer;
