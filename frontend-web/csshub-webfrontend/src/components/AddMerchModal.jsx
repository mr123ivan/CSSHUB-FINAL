import React, { useState } from 'react';
import axios from 'axios';
import { addMerchandise } from '../utils/adminAuth';
import { FaTimes, FaUpload, FaTshirt, FaDollarSign, FaBoxOpen, FaInfoCircle } from 'react-icons/fa';

const AddMerchModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate form
    if (!formData.name || !formData.price || !formData.stock) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    try {
      // Create FormData for multipart/form-data (needed for image upload)
      const merchandiseData = new FormData();
      merchandiseData.append('name', formData.name);
      merchandiseData.append('description', formData.description || '');
      merchandiseData.append('price', parseFloat(formData.price));
      merchandiseData.append('stock', parseInt(formData.stock));
      
      // Append image if it exists
      if (formData.image) {
        merchandiseData.append('imageFile', formData.image); // Using 'imageFile' name to match the backend parameter
      }
      
      // Use our direct authentication method to add the merchandise
      const response = await addMerchandise(merchandiseData);
      
      console.log('Merchandise added response:', response);
      
      // Handle success
      if (response.data && response.status === 200) {
        // Notify parent component of success
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          image: null
        });
        setImagePreview(null);
        
        // Close modal
        onClose();
        
        // Show success message
        alert('Merchandise added successfully!');
      } else {
        setError('Failed to add merchandise. Unexpected response from server.');
      }
    } catch (error) {
      console.error('Error adding merchandise:', error);
      if (error.message === 'Authentication required' || 
          (error.response && error.response.status === 401)) {
        setError('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection to the server.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center rounded-t-lg">
          <div className="flex items-center">
            <FaTshirt className="mr-2" />
            <span>Add New Merchandise</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-black text-yellow-500 p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
              <p className="flex items-center">
                <FaInfoCircle className="mr-2" />
                {error}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter merchandise name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-[100px]"
                  placeholder="Enter merchandise description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2">Price (₱) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaDollarSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Stock *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBoxOpen className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Image</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 h-[220px] flex flex-col items-center justify-center">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, image: null});
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                    <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm">PNG, JPG or JPEG (max. 2MB)</p>
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/png, image/jpeg, image/jpg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                  Saving...
                </>
              ) : (
                <>Add Merchandise</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMerchModal;
