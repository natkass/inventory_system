import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEye, FiEdit, FiTrash, FiPlusCircle, FiX } from "react-icons/fi";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
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
    console.log("ppppp", products.category)
    axios.get("http://127.0.0.1:8000/category/api/Category/")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories!", error));

    axios.get("http://127.0.0.1:8000/manufacturer/Manufacturer/")
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


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const handleStockTopUp = (id) => {
    const newQuantity = prompt("Enter additional stock quantity:", "0");
    const additionalQty = Number(newQuantity);
  
    if (newQuantity && !isNaN(additionalQty) && additionalQty > 0) {
      const productToUpdate = products.find((product) => product.id === id);
      const updatedQuantity = productToUpdate.quantity + additionalQty;
  
      axios.patch(`http://127.0.0.1:8000/products/api/products/${id}/`, {
        quantity: updatedQuantity,
      })
        .then((response) => {
          setProducts(products.map((product) =>
            product.id === id ? { ...product, quantity: updatedQuantity } : product
          ));
        })
        .catch((error) => {
          console.error("Error updating stock quantity!", error);
          alert("Failed to update stock. Try again.");
        });
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search Products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2 border rounded w-full"
        />
        {searchTerm && (
          <FiX className="cursor-pointer ml-2" onClick={clearSearch} />
        )}
      </div>
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
            <th className="p-2">#</th>
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
          {filteredProducts
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((product, index) => (
              <tr key={product.id} className={`border-b text-center ${product.quantity < 5 ? 'bg-yellow-200' : ''}`}
                title={product.quantity < 5 ? 'Low in stock' : ''}>
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{product.name}</td>
                <td className="p-2">{product.description}</td>
                <td className="p-2 relative">
                  <span className={product.quantity < 5 ? "text-red-500 font-bold" : ""}>{product.quantity}</span>
                  {product.quantity < 5 && (
                    <span className="absolute bg-gray-800 text-white text-xs p-1 rounded shadow-lg left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
                      Low in stock
                    </span>
                  )}
                </td>
                <td className="p-2">{product.price}</td>
                <td className="p-2">
                  {categories.find((c) => c.id === product.category)?.name || "-"}
                </td>
                <td className="p-2">
                  {manufacturers.find((m) => m.id === product.manufacturer)?.name || "-"}
                </td>
                <td className="p-2 flex justify-center space-x-2">
                <FiPlusCircle
  className="text-green-600 cursor-pointer"
  title="Top up stock"
  onClick={() => handleStockTopUp(product.id)}
/>
                <FiEye className="text-blue-500 cursor-pointer" onClick={() => handleView(product)} />
                  <FiEdit className="text-yellow-500 cursor-pointer" onClick={() => handleEdit(product)} />
                  <FiTrash className="text-red-500 cursor-pointer" onClick={() => handleDelete(product.id)} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {Math.ceil(filteredProducts.length / itemsPerPage)}</span>
        <button
          disabled={indexOfLastItem >= filteredProducts.length}
          className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
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
