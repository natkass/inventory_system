import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Add this package for decoding tokens

// Create an axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to check if the access token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = jwtDecode(token);
  return decoded.exp * 1000 < Date.now();
};

// Function to refresh the token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
      refresh: refreshToken, // Corrected the refresh token key
    });

    const newAccessToken = response.data.access;
    localStorage.setItem("access_token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return null;
  }
};

// Axios request interceptor to check and refresh token before every request
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("access_token");

  if (isTokenExpired(token)) {
    token = await refreshToken();
    if (!token) {
      console.warn("Session expired. Redirecting to login...");
      return Promise.reject(new Error("Session expired"));
    }
  }

  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Define the async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ customerId, status }, { rejectWithValue }) => {
    try {
      const params = {};
      if (customerId) params.customer_id = customerId;
      if (status) params.status = status;

      const response = await api.get("order/get/", { params });

      return response.data.results;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create an async thunk to complete the order
export const completeOrder = createAsyncThunk(
  "orders/completeOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`order/complete/${orderId}/`);
      return response.data; // Assuming the response has the updated order data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create an async thunk to delete an order (assuming you meant to create a delete function)
export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`order/${orderId}/`);
      return orderId; // Returning the order ID so we can remove it from the state
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const reverseOrder = createAsyncThunk(
  "orders/reverseOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`order/reverse/${orderId}/`);
      return response.data; // Assuming the response contains the updated order
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update the extraReducers to handle the new actions
const orderSlice = createSlice({
  name: "orders",
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
      })
      .addCase(completeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally, update the order in the state
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the order from the state
        state.orders = state.orders.filter(order => order.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(reverseOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(reverseOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the order from the state
        state.orders = state.orders.filter(order => order.id !== action.payload);
      })
      .addCase(reverseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
