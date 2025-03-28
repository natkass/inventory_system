import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showManufacturerForm, setShowManufacturerForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    category: "",
    manufacturer: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [newManufacturer, setNewManufacturer] = useState("");

  useEffect(() => {
    // Fetch products, categories, and manufacturers when the page loads
    axios.get("http://127.0.0.1:8000/products/api/products/") // Adjust to your API URL
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the products!", error);
      });

    // Fetch categories
    axios.get("http://127.0.0.1:8000/api/categories/") // Adjust to your API URL
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the categories!", error);
      });

    // Fetch manufacturers
    axios.get("http://127.0.0.1:8000/api/manufacturers/") // Adjust to your API URL
      .then((response) => {
        setManufacturers(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the manufacturers!", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const handleManufacturerChange = (e) => {
    setNewManufacturer(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/products/api/products/", newProduct) // Adjust to your API URL
      .then((response) => {
        setProducts((prevProducts) => [...prevProducts, response.data]);
        setShowForm(false); // Close the form after successful submission
      })
      .catch((error) => {
        console.error("There was an error adding the product!", error);
      });
  };

  const handleAddCategory = () => {
    axios.post("http://127.0.0.1:8000/api/categories/", { name: newCategory }) // Adjust to your API URL
      .then((response) => {
        setCategories((prevCategories) => [...prevCategories, response.data]);
        setNewCategory("");
        setShowCategoryForm(false); // Close the form after successful addition
      })
      .catch((error) => {
        console.error("There was an error adding the category!", error);
      });
  };

  const handleAddManufacturer = () => {
    axios.post("http://127.0.0.1:8000/api/manufacturers/", { name: newManufacturer }) // Adjust to your API URL
      .then((response) => {
        setManufacturers((prevManufacturers) => [...prevManufacturers, response.data]);
        setNewManufacturer("");
        setShowManufacturerForm(false); // Close the form after successful addition
      })
      .catch((error) => {
        console.error("There was an error adding the manufacturer!", error);
      });
  };

  return (
    <div>
      <h1>Products</h1>
      <button onClick={() => setShowForm(true)}>Add New Product</button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <h2>Add New Product</h2>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            required
          />
          <br />
          <label>Description:</label>
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleChange}
            required
          />
          <br />
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={newProduct.quantity}
            onChange={handleChange}
            required
          />
          <br />
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleChange}
            required
          />
          <br />
          <label>Category:</label>
          <select
            name="category"
            value={newProduct.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setShowCategoryForm(true)}>
            Add New Category
          </button>
          {showCategoryForm && (
            <div>
              <input
                type="text"
                value={newCategory}
                onChange={handleCategoryChange}
                placeholder="New Category Name"
              />
              <button type="button" onClick={handleAddCategory}>Add Category</button>
            </div>
          )}
          <br />
          <label>Manufacturer:</label>
          <select
            name="manufacturer"
            value={newProduct.manufacturer}
            onChange={handleChange}
            required
          >
            <option value="">Select Manufacturer</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setShowManufacturerForm(true)}>
            Add New Manufacturer
          </button>
          {showManufacturerForm && (
            <div>
              <input
                type="text"
                value={newManufacturer}
                onChange={handleManufacturerChange}
                placeholder="New Manufacturer Name"
              />
              <button type="button" onClick={handleAddManufacturer}>Add Manufacturer</button>
            </div>
          )}
          <br />
          <button type="submit">Submit</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Category</th>
            <th>Manufacturer</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.quantity}</td>
              <td>{product.price}</td>
              <td>{product.category}</td>
              <td>{product.manufacturer}</td>
              <td>{product.created_at}</td>
              <td>{product.updated_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;
