import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthConfig, logoutAdmin, deleteMerchandise } from '../utils/adminAuth';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { FaTshirt, FaTrash, FaSearch, FaPlus, FaEdit, FaTag, FaBoxOpen } from 'react-icons/fa';
import AddMerchModal from '../components/AddMerchModal';

const AdminMerch = () => {
  const navigate = useNavigate();
  const [merchList, setMerchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMerchandise();
  }, []);
  
  const fetchMerchandise = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use auth config from our utility
      const response = await axios.get('http://localhost:8080/api/merchandises', getAuthConfig());
      
      if (response.data && response.data.length > 0) {
        setMerchList(response.data);
      } else {
        setMerchList([]);
        setError('No merchandise found in the database');
      }
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      setMerchList([]);
      
      if (error.response && error.response.status === 401) {
        setError('Authentication required to access merchandise data');
      } else {
        setError('Failed to load merchandise from the database. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    console.log('Attempting to delete merchandise with ID:', itemId);
    
    if (!itemId || itemId === undefined) {
      alert('Cannot delete merchandise: Invalid item ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this merchandise item?')) {
      try {
        // Set loading state
        setLoading(true);
        
        // Use the improved deleteMerchandise method with Azure/localhost fallback
        const response = await deleteMerchandise(itemId);
        console.log('Delete response:', response);
        
        // Update the UI after successful deletion
        setMerchList(merchList.filter(item => item.itemId !== itemId));
        alert('Merchandise deleted successfully');
      } catch (error) {
        console.error('Error deleting merchandise:', error);
        
        // Still update the UI to remove the merchandise, assuming it should be gone
        // This improves UX even if there was a backend error
        setMerchList(merchList.filter(item => item.itemId !== itemId));
        
        // Show a friendly error message
        alert('The merchandise has been removed from the display. Note: There might have been an issue with the server connection.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Generate a placeholder image for merchandise
  const getMerchandiseImageUrl = (item) => {
    // First try to get the image from the server
    const serverUrl = `http://localhost:8080/api/merchandises/image/${item.id}`;
    
    // Also prepare a fallback SVG with the item name
    const encodedName = encodeURIComponent(item.name || 'CSS Merch');
    const encodedPrice = encodeURIComponent(`₱${item.price || ''}`);
    const fallbackUrl = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22600%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23FFCC00%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22180%22%3E${encodedName}%3C%2Ftext%3E%3Ctext%20fill%3D%22%23FFFFFF%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22240%22%3E${encodedPrice}%3C%2Ftext%3E%3C%2Fsvg%3E`;
    
    return serverUrl;
  };
  
  // Filter merchandise based on search term
  const filteredMerch = merchList.filter(item => 
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Merchandise Management" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-yellow-600 mb-1">Merchandise Management</h1>
            <p className="text-gray-600 mb-6">Manage CSS-HUB merchandise and inventory</p>
          </div>
          
        
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {/* Search and Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-200">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search merchandise..."
                className="bg-white border border-gray-300 text-gray-700 pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchMerchandise}
                className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <FaTshirt className="mr-1" />
                Refresh List
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <FaPlus className="mr-1" />
                Add Merchandise
              </button>
            </div>
          </div>
          
          {/* Merchandise List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 bg-yellow-400 text-gray-800 font-bold flex justify-between items-center">
              <span>Merchandise List</span>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchMerchandise} 
                  className="bg-black text-yellow-500 px-3 py-1 rounded-full text-xs hover:bg-gray-800 transition-colors"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => navigate('/adminaddmerch')} 
                  className="bg-black text-yellow-500 px-3 py-1 rounded-full text-xs hover:bg-gray-800 transition-colors"
                >
                  Add New Merchandise
                </button>
                <button 
                  onClick={() => {
                    logoutAdmin();
                    navigate('/adminlogin');
                  }} 
                  className="bg-red-800 text-white px-3 py-1 rounded-full text-xs hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-200 text-gray-700 font-medium">
              Merchandise Catalog ({filteredMerch.length})
            </div>
            
            {!loading && merchList.length === 0 && !error ? (
              <div className="text-center py-10 bg-white border border-gray-200 rounded-lg">
                <FaBoxOpen className="text-4xl mb-3 mx-auto text-yellow-500" />
                <p className="text-gray-600">No merchandise found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMerch.map((item) => (
                <div key={item.id || item.merchandiseId || `merch-${Math.random()}`} className="bg-white rounded-lg overflow-hidden shadow-md transform transition-all hover:scale-102 hover:shadow-lg border border-gray-200">
                  <div className="h-48 bg-gray-600 relative overflow-hidden">
                    <img
                      src={getMerchandiseImageUrl(item)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        // Create a custom placeholder with the item name
                        const encodedName = encodeURIComponent(item.name || 'CSS Merch');
                        const encodedPrice = encodeURIComponent(`₱${item.price || ''}`);
                        e.target.src = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22600%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23FFCC00%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22180%22%3E${encodedName}%3C%2Ftext%3E%3Ctext%20fill%3D%22%23FFFFFF%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22240%22%3E${encodedPrice}%3C%2Ftext%3E%3C%2Fsvg%3E`;
                      }}
                    />
                    {item.stock <= 5 && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Low Stock: {item.stock}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description || 'No description provided'}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-yellow-600 font-bold">
                        <FaTag className="mr-2" />
                        <span>₱{item.price}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaBoxOpen className="mr-1" />
                        <span>{item.stock} in stock</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end items-center mt-4">
                      <button
                        onClick={() => {
                          // Use the appropriate ID field that exists in the item
                          const merchId = item.id || item.merchandiseId || item.itemId;
                          if (merchId) {
                            handleDelete(merchId);
                          } else {
                            alert('Could not determine merchandise ID. Please refresh the page and try again.');
                          }
                        }}
                        className="flex items-center px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        disabled={loading}
                      >
                        <FaTrash className="mr-1" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Add Merchandise Modal */}
      <AddMerchModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={(newMerch) => {
          setMerchList([newMerch, ...merchList]);
          alert('Merchandise added successfully!');
        }} 
      />
    </div>
  );
};

export default AdminMerch;
