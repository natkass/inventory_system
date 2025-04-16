import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, deleteCustomer, addCustomer } from '../redux/customerSlice';
import { Button, IconButton, Tooltip, Chip } from '@material-tailwind/react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FiX } from 'react-icons/fi';

const CustomerPage = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);

  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', is_active: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      customer.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [customers, debouncedSearch]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDelete = (id) => {
    dispatch(deleteCustomer(id));
  };

  const handleOpen = () => {
    setOpen(!open);
    setNewCustomer({ name: '', email: '', is_active: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addCustomer(newCustomer)).then(() => {
      handleOpen(); // close dialog
      dispatch(fetchCustomers()); // refresh list
    });
  };

  const handleNext = () => page < totalPages && setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);

  if (loading) return <p className="text-gray-700">Loading customers...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={handleOpen} className="bg-blue-700">
          Add Customer
        </Button>
      </div>

      <div className="mb-4 flex items-center bg-white shadow-md rounded-lg px-4 py-2">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full outline-none p-2 text-gray-700"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-gray-500 hover:text-gray-700">
            <FiX size={18} />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer, index) => (
                <tr key={customer.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{(page - 1) * itemsPerPage + index + 1}</td>
                  <td className="p-3">{customer.name}</td>
                  <td className="p-3">{customer.email}</td>
                  <td className="p-3">
                    <Chip
                      value={customer.is_active ? 'Active' : 'Inactive'}
                      color={customer.is_active ? 'green' : 'red'}
                      variant="ghost"
                      size="sm"
                    />
                  </td>
                  <td className="p-3">{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td className="p-3 flex gap-2">
                    <Tooltip content="View">
                      <IconButton className="bg-blue-600 text-white">
                        <EyeIcon className="h-5 w-5" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Edit">
                      <IconButton className="bg-yellow-600 text-white">
                        <PencilIcon className="h-5 w-5" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Delete">
                      <IconButton onClick={() => handleDelete(customer.id)} className="bg-red-600 text-white">
                        <TrashIcon className="h-5 w-5" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button onClick={handlePrev} disabled={page === 1} variant="outlined">
          Previous
        </Button>
        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>
        <Button onClick={handleNext} disabled={page === totalPages} variant="outlined">
          Next
        </Button>
      </div>

      {/* Add Customer Form (Dialog) */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 inline">Add New Customer</h2>
            <button className="text-xl font-bold mb-4 ml-36" onClick={() => setOpen(false)}>X</button>
            <form onSubmit={handleSubmit} className="space-y-5">
  <div>
    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Customer Name</label>
    <input
      type="text"
      name="name"
      placeholder="Enter Customer Name"
      value={newCustomer.name}
      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E6C6C] focus:outline-none transition duration-300"
    />
  </div>
  <div>
    <label htmlFor="tin" className="block text-sm font-medium text-gray-700">TIN</label>
    <input
      type="text"
      name="tin"
      placeholder="Enter Customer TIN"
      value={newCustomer.tin}
      onChange={(e) => setNewCustomer({ ...newCustomer, tin: e.target.value })}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E6C6C] focus:outline-none transition duration-300"
    />
  </div>

  <div>
    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
    <input
      type="email"
      name="email"
      placeholder="Enter Email"
      value={newCustomer.email}
      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E6C6C] focus:outline-none transition duration-300"
    />
  </div>

  <div>
    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
    <input
      type="text"
      name="phone"
      placeholder="Enter Phone"
      value={newCustomer.phone}
      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E6C6C] focus:outline-none transition duration-300"
    />
  </div>

  <div>
    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
    <input
      type="text"
      name="address"
      placeholder="Enter Address"
      value={newCustomer.address}
      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
      required
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7E6C6C] focus:outline-none transition duration-300"
    />
  </div>

  <div className="flex justify-between gap-4 mt-4">
    <button
      type="submit"
      className="bg-[#7E6C6C] text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-[#6b5b5b] focus:outline-none transition duration-200"
    >
      Submit
    </button>
    <button
      type="button"
      className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-500 focus:outline-none transition duration-200"
      onClick={() => setOpen(false)}
    >
      Cancel
    </button>
  </div>
</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
