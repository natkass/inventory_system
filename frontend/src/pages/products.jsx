import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    category: "",
    manufacturer: "",
  });

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/products/api/products/")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products!", error));
console.log("ppppp",products.category)
    axios.get("http://127.0.0.1:8000/category/api/Category/")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories!", error));

    axios.get("http://127.0.0.1:8000//api/manufacturers/")
      .then((response) => setManufacturers(response.data))
      .catch((error) => console.error("Error fetching manufacturers!", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios.delete(`http://127.0.0.1:8000/products/api/products/${id}/`)
        .then(() => setProducts(products.filter((product) => product.id !== id)))
        .catch((error) => console.error("Error deleting product!", error));
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/products/api/products/", newProduct)
      .then((response) => {
        setProducts((prev) => [...prev, response.data]);
        setShowForm(false);
      })
      .catch((error) => console.error("Error adding product!", error));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <button
        className="bg-[#7E6C6C] text-white px-4 py-2 rounded-md hover:opacity-80"
        onClick={() => setShowForm(true)}
      >
        Add New Product
      </button>


      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 inline">Add New Product</h2>
            <button className="text-xl font-bold mb-4 ml-36" onClick={() => setShowForm(false)}>X</button>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newProduct.description}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <div className="w-full">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={newProduct.quantity}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="w-full mt-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Enter price"
                  value={newProduct.price}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <select
                name="category"
                value={newProduct.category}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                name="manufacturer"

                value={newProduct.manufacturer}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map((man) => (
                  <option key={man.id} value={man.id}>{man.name}</option>
                ))}
              </select>
              <div className="flex justify-between">
                <button type="submit" className="bg-[#7E6C6C] text-white px-4 py-2 rounded">Submit</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="w-full mt-6 border-collapse text-center">
        <thead>
          <tr className="bg-[#7E6C6C] text-white">
            <th className="p-2">Name</th>
            <th className="p-2">Description</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Price</th>
            <th className="p-2">Category</th>
            <th className="p-2">Manufacturer</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b text-center">
              <td className="p-2">{product.name}</td>
              <td className="p-2">{product.description}</td>
              <td className="p-2">{product.quantity}</td>
              <td className="p-2">{product.price}</td>
              <td className="p-2">
                {categories.find((c) => c.id === product.category)?.name || "-"}
              </td>
              <td className="p-2">
                {manufacturers.find((m) => m.id === product.manufacturer)?.name || "-"}
              </td>
              <td className="p-2 flex justify-center space-x-2">
                <FiEye
                  className="text-blue-500 cursor-pointer"
                  onClick={() => handleView(product)}
                />
                <FiEdit
                  className="text-yellow-500 cursor-pointer"
                  onClick={() => handleEdit(product)}
                />
                <FiTrash
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDelete(product.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Product" : "Product Details"}</h2>
            <form className="space-y-3">
              <input
                type="text"
                name="name"
                value={selectedProduct.name}
                readOnly={!isEdit}
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                value={selectedProduct.description}
                readOnly={!isEdit}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="quantity"
                value={selectedProduct.quantity}
                readOnly={!isEdit}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="price"
                value={selectedProduct.price}
                readOnly={!isEdit}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded w-full"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsPage;
