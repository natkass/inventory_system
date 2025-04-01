import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewRequestPage = () => {
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([
    { product_id: '', quantity: '', price: 0, subtotal: 0 , total_amount:0}
  ]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [vat, setVat]= useState(0);

  // Fetch products from API
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/products/api/products/') // Change URL as needed
      .then(response => {
        setAvailableProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  // Fetch customers from API
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/customers/api/customers/') // Change URL as needed
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });
  }, []);

  // Handle customer selection
  const handleCustomerChange = (e) => {
    const selectedCustomer = customers.find(c => c.id === parseInt(e.target.value));
    if (selectedCustomer) {
      setCustomerId(selectedCustomer.id);
      setCustomerName(selectedCustomer.name); // Set the customer's name
    }
  };

  // Handle product selection
  const handleProductChange = (index, value) => {
    const selectedProduct = availableProducts.find(p => p.id === parseInt(value));
    if (!selectedProduct) return;

    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product_id: selectedProduct.id,
      price: Number(selectedProduct.price),
      subtotal: Number(selectedProduct.price) * Number(updatedProducts[index].quantity || 0),
    };

    setProducts(updatedProducts);
    calculateTotal(updatedProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const updatedProducts = [...products];
    updatedProducts[index].quantity = Number(value);
    updatedProducts[index].subtotal = Number(updatedProducts[index].price) * Number(value || 0);

    setProducts(updatedProducts);
    calculateTotal(updatedProducts);
  };

  // Add new product row
  const addProduct = () => {
    setProducts([...products, { product_id: '', quantity: '', price: 0, subtotal: 0 }]);
  };

  // Remove a product row
  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    calculateTotal(updatedProducts);
  };

  // Calculate total price
  const calculateTotal = (updatedProducts) => {
    const total = updatedProducts.reduce((acc, product) => acc + product.subtotal, 0);
    const vat = total * 0.15; // Calculate VAT
    const totalPrice = total + vat; // Calculate total price
  
    setVat(vat); // Update VAT state
    setTotalPrice(totalPrice); // Update total price state
  };
  

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const requestData = {
      customer_id: customerId || null,
      products: products.map(({ product_id, quantity }) => ({ product_id, quantity })),
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/order/create/', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccessMessage('Order placed successfully!');
      setProducts([{ product_id: '', quantity: '', price: 0, subtotal: 0 }]);
      setCustomerId('');
      setCustomerName('');
      setTotalPrice(0);
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create order. Please try again.');
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create New Order</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Dropdown */}
        <div>
          <label className="block text-sm font-medium">Customer</label>
          <select
            value={customerId}
            onChange={handleCustomerChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Product Fields */}
        {products.map((product, index) => (
          <div key={index} className="flex space-x-2 items-center">
            {/* Product Dropdown */}
            <select
              value={product.product_id}
              onChange={(e) => handleProductChange(index, e.target.value)}
              required
              className="w-1/3 px-3 py-2 border rounded"
            >
              <option value="">Select Product</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price}
                </option>
              ))}
            </select>

            {/* Quantity Input */}
            <input
              type="number"
              placeholder="Quantity"
              value={product.quantity}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              required
              className="w-1/4 px-3 py-2 border rounded"
            />

            {/* Price Display */}
            <td>${Number(product.price).toFixed(2)}</td>

            {/* Subtotal Display */}
            <td>${Number(product.subtotal).toFixed(2)}</td>

            {/* Remove Button */}
            {products.length > 1 && (
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add Product Button */}
        <button type="button" onClick={addProduct} className="text-blue-500">
          + Add Another Product
        </button>

        {/* Invoice Summary */}
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="text-lg font-semibold">Invoice Summary</h2>
          <table className="w-full mt-2 border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left">Product</th>
                <th>Qty</th>
                <th>Price</th>
                {/* <th>Vat</th> */}
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <tr key={i} className="border-b">
                  <td>{availableProducts.find(ap => ap.id === product.product_id)?.name || 'N/A'}</td>
                  <td>{product.quantity}</td>
                  <td>${product.price.toFixed(2)}</td>
                  {/* <td>${(product.price * 0.15).toFixed(2)}</td> */}
                  <td>${product.subtotal.toFixed(2)}</td>
                  {/* <td>${product.total_amount.toFixed(2)}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right mt-2 font-bold text-xl">
            Vat: ${vat.toFixed(2)}
          </div>
          <div className="text-right mt-2 font-bold text-xl">
            Total: ${totalPrice.toFixed(2)}
          </div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default NewRequestPage;
