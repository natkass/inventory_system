import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/customers/api/customers/';

export const fetchCustomers = createAsyncThunk('customers/fetch', async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
});

export const addCustomer = createAsyncThunk('customers/add', async (customer) => {
  const response = await axios.post(BASE_URL, customer);
  return response.data;
});

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, data }) => {
  const response = await axios.put(`${BASE_URL}${id}/`, data);
  return response.data;
});

export const deleteCustomer = createAsyncThunk('customers/delete', async (id) => {
  await axios.delete(`${BASE_URL}${id}/`);
  return id;
});

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.customers[index] = action.payload;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
      });
  },
});

export default customerSlice.reducer;
