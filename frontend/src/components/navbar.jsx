import React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = ({ search, setSearch, handleSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Define dynamic title based on location
  const getTitle = () => {
    if (location.pathname === "/orders") return "Orders";
    return "Navbar"; // Default title
  };

  return (
    <nav className="bg-[#2C2C2C] p-4 text-white flex justify-between items-center">
      <h1 className="text-lg font-bold">{getTitle()}</h1>

      {/* Conditionally render search bar if on /orders page */}
      {location.pathname === "/orders" && (
        <div className="flex gap-2">
          <button
        onClick={() => navigate('/orders/new-request')}
        className="mt-4 bg-[#7E6C6C] text-white px-6 py-2 rounded-lg shadow-md hover:bg-teal-900 transition"
      >
        Add Order
      </button>
        </div>
      )}
       {location.pathname === "/products" && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-300 rounded text-black"
          />
          <button
            onClick={handleSearch}
            className="p-2 bg-[#7E6C6C] text-white rounded"
          >
            Search
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
