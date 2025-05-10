import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import UserNavbar from '../components/UserNavbar';
import { useMsal } from '@azure/msal-react';
import { FaSearch, FaShoppingCart, FaTag, FaBoxOpen, FaSpinner } from 'react-icons/fa';

const MerchPage = () => {
  const [merchList, setMerchList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const userName = activeAccount?.name || 'User';

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async (keyword = '') => {
    setLoading(true);
    try {
      const response = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/merchandises', {
        params: { keyword },
      });
      setMerchList(response.data);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMerchandise(searchKeyword);
  };

  const handleBuyNow = (item) => {
    navigate('/productpreview', { state: { merch: item } }); // Passing the selected product as state
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-black">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <UserNavbar />

        {/* Hero Banner */}
        <div className="bg-yellow-500 text-black py-8 px-8 md:px-12 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">CSS-HUB Merchandise</h1>
            <p className="text-gray-800 text-lg">Show your Computer Science Society pride with our exclusive merchandise collection</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  placeholder="Search for merchandise..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => setSearchKeyword('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center"
              >
                <FaSearch className="mr-2" />
                Search
              </button>
            </div>
          </form>

          {/* Merchandise Section */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-yellow-500 text-black px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">AVAILABLE MERCHANDISE</h2>
                <p className="text-sm text-gray-800">{merchList.length} items found</p>
              </div>
              <div className="flex items-center gap-2">
                <FaShoppingCart className="text-xl" />
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaSpinner className="text-4xl animate-spin mb-4 text-yellow-500" />
                <p>Loading merchandise...</p>
              </div>
            ) : merchList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {merchList.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 hover:scale-102 border border-gray-600"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={`https://ccshub-systeminteg.azurewebsites.net/api/merchandises/image/${item.id}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/300x150/333333/FFCC00?text=${encodeURIComponent(item.name)}`;
                        }}
                      />
                      {item.stock <= 5 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Only {item.stock} left!
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description || 'No description available'}</p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center text-yellow-500 font-bold">
                          <FaTag className="mr-1" />
                          <span>₱{item.price}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-400 text-sm">
                          <FaBoxOpen className="mr-1" />
                          <span>{item.stock} in stock</span>
                        </div>
                      </div>
                      
                      <button
                        className="w-full mt-2 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center"
                        onClick={() => handleBuyNow(item)}
                      >
                        <FaShoppingCart className="mr-2" />
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaBoxOpen className="text-4xl mb-4 text-yellow-500" />
                <p className="text-xl">No merchandise found</p>
                <p className="text-sm mt-2">Try a different search term or check back later</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchPage;
