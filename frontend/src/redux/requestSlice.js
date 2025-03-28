import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
let token = "";
setInterval(() => {
  token = localStorage.getItem("access_token");
}, 5000); 
// Fetch Requests Action
export const fetchRequests = createAsyncThunk('requests/fetchRequests', async (_, { rejectWithValue }) => {
  try {

    if (!token) {
      return rejectWithValue('No access token found');
    }

    const response = await axios.get('http://127.0.0.1:8000/order/get', {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in the header
      },
    });

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Something went wrong');
  }
});

const requestSlice = createSlice({
  name: 'requests',
  initialState: { requests: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default requestSlice.reducer;
