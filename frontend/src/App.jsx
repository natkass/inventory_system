// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RequestsPage from './pages/RequestsPage';
import NewRequestPage from './pages/NewRequestPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/products';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/request" element={<RequestsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/new-request" element={<NewRequestPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
