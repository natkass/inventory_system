import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../redux/orderSlice';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  
  useEffect(() => {
    dispatch(fetchOrders({ customerId: null, status: null }));
  }, [dispatch]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/customers/api/customers/')
      .then(response => setCustomers(response.data))
      .catch(error => console.error('Error fetching customers:', error));
  }, []);

  if (loading) return <p className="text-gray-700">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#7E6C6C] mb-4">Orders</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-[#7E6C6C] rounded-lg shadow-lg">
          <thead>
            <tr className="bg-[#7E6C6C] text-white">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Total Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border border-[#7E6C6C] bg-white hover:bg-gray-100">
                  <td className="px-4 py-2">{order.id}</td>
                  <td className="px-4 py-2">{order.customer_name}</td>
                  <td className="px-4 py-2">{order.total_amount}</td>
                  <td className="px-4 py-2">{order.status}</td>
                  <td className="px-4 py-2">{order.created_at}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-2 text-center text-gray-600">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => navigate('/new-request')}
        className="mt-4 bg-[#7E6C6C] text-white px-6 py-2 rounded-lg shadow-md hover:bg-teal-900 transition"
      >
        Add Order
      </button>
    </div>
  );
};

export default OrdersPage;