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


// Fetch all categories
export const fetchDashboardSummary = createAsyncThunk(
  "fetchDashboardSummary",
  async (_, { rejectWithValue }) => {
    try {
        const params = {};
      const response = await api.get("/dashboard/summary/"); // API endpoint for fetching all categories
        console.log("Dashboard summary response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Dashboard slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    dashboard: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
