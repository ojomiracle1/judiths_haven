import axios from '../../utils/axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchReviews = createAsyncThunk('reviews/fetch', async (productId) => {
  const { data } = await axios.get(`/api/products/${productId}/reviews`);
  return data;
});

export const addReview = createAsyncThunk('reviews/add', async ({ productId, rating, comment }, thunkAPI) => {
  await axios.post(`/api/products/${productId}/reviews`, { rating, comment });
  return thunkAPI.dispatch(fetchReviews(productId));
});

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: { items: [], isLoading: false },
  reducers: {
    resetReviews: (state) => {
      state.items = [];
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => { state.isLoading = true; })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state) => { state.isLoading = false; });
  },
});

export const { resetReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
