// src/pages/OrdersPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../redux/orderSlice';
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    // Fetch orders on page load
    dispatch(fetchOrders({ customerId: null, status: null }));
  }, [dispatch]);
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/customers/api/customers/') // Change URL as needed
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });
  }, []);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Orders</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Order ID</th>
            <th className="border border-gray-300 px-4 py-2">Customer ID</th>
            <th className="border border-gray-300 px-4 py-2">Total Amount</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.order_id}>
                <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                <td className="border border-gray-300 px-4 py-2">{order.customer_name}</td>
                <td className="border border-gray-300 px-4 py-2">{order.total_amount}</td>
                <td className="border border-gray-300 px-4 py-2">{order.status}</td>
                <td className="border border-gray-300 px-4 py-2">{order.created_at}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="border border-gray-300 px-4 py-2 text-center">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={() => navigate('/new-request')}>
            Add Order
        </button>
    </div>
  );
};

export default OrdersPage;
