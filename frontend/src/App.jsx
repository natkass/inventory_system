// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout"; // Ensure Layout is imported
import RequestsPage from "./pages/RequestsPage";
import NewRequestPage from "./pages/NewRequestPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/products";
import CategoryList from "./pages/Category";
import { Sidebar, Menu, MenuItem, Submenu, Logo } from "react-mui-sidebar"
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route (No Layout) */}
        <Route path="/" element={<LoginPage />} />

        {/* Private Routes Wrapped in Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/request" element={<RequestsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/new-request" element={<NewRequestPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/category" element={<CategoryList />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
