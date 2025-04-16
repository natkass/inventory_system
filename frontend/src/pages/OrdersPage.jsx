import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, completeOrder, reverseOrder } from '../redux/orderSlice';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Button, Tooltip, IconButton, Chip, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { EyeIcon, ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FiX } from "react-icons/fi";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchOrders({ search: debouncedSearch, page }));
  }, [dispatch, page]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const clearSearch = () => setSearchTerm('');

  const filteredOrders = useMemo(() =>
    orders.filter(order =>
      ((activeTab === 'pending' && order.status !== 'completed') ||
       (activeTab === 'completed' && order.status === 'completed')) &&
      (order.customer_name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
       order.id.toString().includes(debouncedSearch))
    ), [orders, activeTab, debouncedSearch]
  );

  const currentOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOrderAction = async (action, orderId) => {
    try {
      await dispatch(action(orderId));
      dispatch(fetchOrders({ page }));
    } catch (error) {
      console.error(`Error processing order:`, error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`your-api-endpoint/order/${orderId}`);
      dispatch(fetchOrders({ page }));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };
  const handleViewReceipt = async (order) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/order/invoice/${order}`, {
        responseType: "blob", // Ensures PDF response
      });
      const fileURL = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(fileURL, "_blank"); // Open in new tab
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <p className="text-gray-700">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Order List</h1>

      <div className="mb-4 flex items-center bg-white shadow-md rounded-lg px-4 py-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by Customer Name or Order ID..."
          className="w-full outline-none p-2 text-gray-700"
        />
        {searchTerm && (
          <button onClick={clearSearch} className="text-gray-500 hover:text-gray-700">
            <FiX size={18} />
          </button>
        )}
      </div>

      <div className="flex justify-between mb-4">
        {['pending', 'completed'].map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            color={activeTab === tab ? "green" : "gray"}
            variant="outlined"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Orders
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left border border-gray-200 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-700 text-white">
              {['Order ID', 'Customer', 'Amount', 'Status', 'Created At', 'Actions'].map((col) => (
                <th key={col} className="p-2">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map(({ id, customer_name, total_amount, status, order_date }) => (
                <tr key={id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="p-4">{id}</td>
                  <td className="p-4">{customer_name}</td>
                  <td className="p-4">${total_amount}</td>
                  <td className="p-4">
                    <Chip variant="ghost" size="sm" value={status} color={status === 'pending' ? 'blue-gray' : status === 'reversed' ? 'amber' : 'green'} />
                  </td>
                  <td className="p-4">{order_date}</td>
                  <td className="p-4 flex space-x-2">
                    {(status === 'pending' || status === 'reversed') && (
                      <Button onClick={() => handleOrderAction(completeOrder, id)} className={`px-4 py-1 text-white ${status === 'reversed' ? 'bg-orange-400' : 'bg-green-600'}`} size="sm">Complete</Button>
                    )}
                    {status === 'completed' && (
                      <>
                        <Tooltip content="View Receipt">
                          <IconButton onClick={() => handleViewReceipt(id)} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700" size="sm">
                            <EyeIcon className="h-5 w-5" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Reverse Order">
                          <IconButton onClick={() => handleOrderAction(reverseOrder, id)} className="bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-700" size="sm">
                            <ArrowLeftIcon className="h-5 w-5" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Delete Order">
                          <IconButton onClick={() => handleDeleteOrder(id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700" size="sm">
                            <TrashIcon className="h-5 w-5" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Button onClick={() => navigate('/new-request')} className="mt-4 bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md hover:bg-teal-900 transition">Add Order</Button>
      </div>
      {/* Receipt Dialog */}
       {/* Receipt Dialog */}
       {selectedOrder && (
        <Dialog open={isReceiptOpen} handler={() => setIsReceiptOpen(false)} className="max-w-2xl bg-white rounded-lg shadow-lg">
          <DialogHeader className="text-2xl font-bold text-gray-800">Receipt</DialogHeader>
          <DialogBody className="space-y-4 py-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Company Name</h2>
              <p className="text-gray-600">123 Business Street, City, Country</p>
              <p className="text-gray-600">Phone: +123 456 7890 | Email: info@company.com</p>
              <hr className="my-4" />
            </div>
            <div>
              <p className="text-gray-800"><strong>Order ID:</strong> {selectedOrder.id}</p>
              <p className="text-gray-800"><strong>Customer:</strong> {selectedOrder.customer_name}</p>
              <p className="text-gray-800"><strong>Total Amount:</strong> ${selectedOrder.total_amount}</p>
              <p className="text-gray-800"><strong>Status:</strong> {selectedOrder.status}</p>
              <p className="text-gray-800"><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
            </div>
          </DialogBody>
          <DialogFooter className="flex justify-between items-center space-x-2">
            <Button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2">Print</Button>
            <Button onClick={() => setIsReceiptOpen(false)} className="bg-red-600 text-white px-4 py-2">Close</Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};

export default OrdersPage;
