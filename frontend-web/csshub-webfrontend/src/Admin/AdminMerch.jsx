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
        // Use the direct deleteMerchandise method that handles authentication
        const response = await deleteMerchandise(itemId);
        
        console.log('Delete response:', response);
        
        // Update the UI after successful deletion
        setMerchList(merchList.filter(item => item.itemId !== itemId));
        alert('Merchandise deleted successfully');
      } catch (error) {
        console.error('Error deleting merchandise:', error);
        
        if (error.message === 'Authentication required' || 
            (error.response && error.response.status === 401)) {
          // Authentication error
          alert('Authentication required. Please log in again.');
          navigate('/adminlogin', { state: { from: '/adminmerch' } });
        } else {
          alert('Failed to delete merchandise. Please try again.');
        }
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
    <div className="flex h-screen bg-gray-900 text-white">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Merchandise Management" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-yellow-500 mb-2">Merchandise Catalog</h1>
            <p className="text-gray-400">Manage CSS-HUB merchandise and inventory</p>
          </div>
          
        
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
              <p className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {/* Search and Controls */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search merchandise..."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchMerchandise}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
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
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center">
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
            
            <div className="p-4 bg-gray-700 text-white font-medium">
              Merchandise Catalog ({filteredMerch.length})
            </div>
            
            {!loading && filteredMerch.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No merchandise matches your search' : 'No merchandise found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {filteredMerch.map((item) => (
                  <div key={item.itemId} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors">
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
                      <h3 className="font-bold text-white text-lg mb-2">{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description || 'No description provided'}</p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-yellow-400 font-bold">
                          <FaTag className="mr-2" />
                          <span>₱{item.price}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-400 text-sm">
                          <FaBoxOpen className="mr-1" />
                          <span>{item.stock} in stock</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => handleDelete(item.itemId)}
                          className="flex items-center px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <FaTrash className="mr-1" />
                          <span>Delete</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            // For now, just alert that editing is in development
                            alert('Edit functionality is under development');
                            // In a real implementation, you would navigate to the edit page
                            // navigate(`/admin/edit-merchandise/${item.id}`);
                          }}
                          className="flex items-center px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          <FaEdit className="mr-1" />
                          <span>Edit</span>
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
