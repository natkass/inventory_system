import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../redux/categorySlice";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { Dialog } from "@headlessui/react";

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const categoriesPerPage = 8;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditCategoryName(category.name);
    setEditDescription(category.description);
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = () => {
    if (!categoryName || !description) {
      alert("Please fill in all fields.");
      return;
    }

    dispatch(createCategory({ name: categoryName, description }))
      .unwrap()
      .then(() => {
        alert("Category added successfully!");
        setIsAddModalOpen(false);
        setCategoryName("");
        setDescription("");
      })
      .catch((error) => {
        console.error("Error adding category:", error);
        alert("Failed to add category.");
      });
  };

  const handleSubmitEdit = () => {
    if (!editCategoryName || !editDescription) {
      alert("Please fill in all fields.");
      return;
    }

    dispatch(updateCategory({ id: selectedCategory.id, updatedData: { name: editCategoryName, description: editDescription } }))
      .unwrap()
      .then(() => {
        alert("Category updated successfully!");
        setIsEditModalOpen(false);
      })
      .catch((error) => {
        console.error("Error updating category:", error);
        alert("Failed to update category.");
      });
  };

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
      <button 
        onClick={handleAddCategory} 
        className="mt-auto mb-4 mx-auto bg-[#7E6C6C] text-white px-4 py-2 rounded-md hover:opacity-80"
      >
        Add Category
      </button>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {currentCategories.map(category => (
    <div 
      key={category.id} 
      className="p-4 border rounded-lg shadow-md bg-white cursor-pointer flex flex-col min-h-[200px] max-h-[300px]"
      onClick={() => {
        setSelectedCategory(category);
        setIsDetailModalOpen(true);
      }}
    >
      <h3 className="text-lg font-semibold mb-2 overflow-hidden text-ellipsis whitespace-nowrap" title={category.name}>
        {category.name}
      </h3>
      <p className="text-gray-600 flex-grow overflow-hidden text-ellipsis">{category.description}</p>

      {/* Footer with edit and delete icons */}
      <footer className="mt-auto flex justify-between items-center pt-4 border-t">
        <span className="flex gap-2">
          <FaEdit className="text-blue-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }} />
          <FaTrash className="text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCategoryToDelete(category); setIsDeleteConfirmOpen(true); }} />
        </span>
      </footer>
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

      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          <button className="absolute top-2 right-2" onClick={() => setIsAddModalOpen(false)}>
            <FaTimes className="text-gray-600" />
          </button>
          <h3 className="text-lg font-bold">Add Category</h3>
          <input
            type="text"
            placeholder="Category Name"
            className="border p-2 w-full mt-2"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 w-full mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleSubmitAdd}>
            Submit
          </button>
        </div>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
          <button className="absolute top-2 right-2" onClick={() => setIsEditModalOpen(false)}>
            <FaTimes className="text-gray-600" />
          </button>
          <h3 className="text-lg font-bold">Edit Category</h3>
          <input
            type="text"
            placeholder="Category Name"
            className="border p-2 w-full mt-2"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 w-full mt-2"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleSubmitEdit}>
            Update
          </button>
        </div>
      </Dialog>

      {/* Category Details Modal */}
      <Dialog open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold">{selectedCategory?.name}</h3>
          <p>{selectedCategory?.description}</p>
          <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setIsDetailModalOpen(false)}>Close</button>
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
