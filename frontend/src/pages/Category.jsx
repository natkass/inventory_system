import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, createCategory, deleteCategory } from "../redux/categorySlice";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Dialog } from "@headlessui/react";

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const categoriesPerPage = 10;
  
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      dispatch(deleteCategory(categoryToDelete.id));
      setIsDeleteConfirmOpen(false);
    }
  };

  // Pagination logic
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentCategories.map(category => (
          <div key={category.id} onClick={() => { setSelectedCategory(category); setIsDetailModalOpen(true); }} className="p-4 border rounded-lg shadow-md bg-white">
            <h3 className="text-lg font-semibold flex justify-between">
              {category.name}
              <span className="flex gap-2">

                <FaEdit 
                  className="text-blue-500 cursor-pointer" 
                  onClick={() => { setSelectedCategory(category); setIsEditModalOpen(true); }} 
                />
                <FaTrash 
                  className="text-red-500 cursor-pointer" 
                  onClick={() => { setCategoryToDelete(category); setIsDeleteConfirmOpen(true); }} 
                />
              </span>
            </h3>
            <p className="text-gray-600">{category.description}</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>
        <span className="text-lg font-semibold">{currentPage} / {totalPages}</span>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>

      {/* Category Details Modal */}
      <Dialog open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold">{selectedCategory?.name}</h3>
          <p>{selectedCategory?.description}</p>
          <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setIsDetailModalOpen(false)}>Close</button>
        </div>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold">Edit Category</h3>
          <input type="text" value={selectedCategory?.name} className="border p-2 w-full mt-2" />
          <input type="text" value={selectedCategory?.description} className="border p-2 w-full mt-2" />
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">Save Changes</button>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold">Are you sure you want to delete this category?</h3>
          <div className="mt-4 flex justify-end gap-2">
            <button className="bg-gray-300 px-4 py-2 rounded-md" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleDeleteCategory}>Yes, Delete</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CategoryList;