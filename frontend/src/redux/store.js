import { configureStore } from "@reduxjs/toolkit";
import requestReducer from "./requestSlice"; // Correct path to your slice
import orderReducer from "./orderSlice";

const store = configureStore({
  reducer: {
    requests: requestReducer, // Make sure it's the correct name and reducer
    orders: orderReducer,
  },
});

export default store;
