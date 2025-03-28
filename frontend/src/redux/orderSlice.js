// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to refresh the token
const refreshToken = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:8000//api/token/refresh/', {
      refresh_token: localStorage.getItem('refresh_token'),
    });
    const newAccessToken = response.data.access_token;
    localStorage.setItem('access_token', newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
};

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
  response => response, // If the request is successful, just return the response
  async error => {
    const originalRequest = error.config;

    // If the error is 401 (unauthorized), attempt to refresh the token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshToken();

      if (newAccessToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        // Retry the original request with the new token
        return api(originalRequest);
      }
    }

    // If token refresh fails or the error is not 401, reject the promise
    return Promise.reject(error);
  }
);

// Define the async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ customerId, status }, { rejectWithValue }) => {
    try {
      const params = {};
      if (customerId) params.customer_id = customerId;
      if (status) params.status = status;

      const response = await api.get('order/get/', {
        params: params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      return response.data.results; // assuming 'results' contains the orders
    } catch (error) {
      return rejectWithValue(error.response.data || error.message);
    }
  }
);

// Create the slice
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
