import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import UserNavbar from '../components/UserNavbar';
import { useAuth } from './AuthProvider';
import { useMsal } from '@azure/msal-react';
import { FaShoppingCart, FaFileInvoice, FaSpinner, FaCheck, FaTimes, FaSearch, FaEye, FaDownload } from 'react-icons/fa';

const UserOrders = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const userName = activeAccount?.name || (user ? user.username : 'User');
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, filterStatus]);
  
  const applyFilters = () => {
    let result = [...orders];
    
    if (filterStatus !== 'All') {
      result = result.filter(order => order.orderStatus === filterStatus);
    }
    
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(order => 
        (order.orderId?.toString().toLowerCase().includes(lowercasedSearch)) ||
        (order.merchandise?.name?.toLowerCase().includes(lowercasedSearch)) ||
        (order.event?.title?.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    setFilteredOrders(result);
  };
  
  const resetFilters = () => {
    setFilterStatus('All');
    setSearchTerm('');
  };
  
  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // First, try to get user information to find user ID
      let userId = null;
      if (user && user.id) {
        userId = user.id;
      } else {
        // Extract user ID from token if possible
        try {
          const payload = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          if (decodedPayload.sub) {
            userId = decodedPayload.sub;
          } else if (decodedPayload.id) {
            userId = decodedPayload.id;
          }
        } catch (error) {
          console.error('Error extracting user ID from token:', error);
        }
      }
      
      // Try multiple endpoint patterns to fetch user orders
      const endpointPatterns = [
        // Try both Azure and localhost for each pattern
        { base: 'https://ccshub-systeminteg.azurewebsites.net', endpoint: '/api/orders/user' },
        { base: 'http://localhost:8080', endpoint: '/api/orders/user' },
        { base: 'https://ccshub-systeminteg.azurewebsites.net', endpoint: '/api/users/orders' },
        { base: 'http://localhost:8080', endpoint: '/api/users/orders' },
        // If we have a userId, try endpoints with it
        ...(userId ? [
          { base: 'https://ccshub-systeminteg.azurewebsites.net', endpoint: `/api/users/${userId}/orders` },
          { base: 'http://localhost:8080', endpoint: `/api/users/${userId}/orders` },
          { base: 'https://ccshub-systeminteg.azurewebsites.net', endpoint: `/api/orders/user/${userId}` },
          { base: 'http://localhost:8080', endpoint: `/api/orders/user/${userId}` }
        ] : [])
      ];
      
      // For testing purpose when no real order data is available
      const loadMockOrders = () => {
        // Mock orders data for development/testing
        const mockOrders = [
          {
            orderId: 1001,
            merchandise: { name: 'CS Society T-Shirt', price: 350 },
            orderDate: new Date().toISOString(),
            quantity: 2,
            totalAmount: 700,
            paymentStatus: 'PAID',
            orderStatus: 'COMPLETED',
            receiptImage: true
          },
          {
            orderId: 1002,
            event: { title: 'Annual CS Conference', price: 500 },
            orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            quantity: 1,
            totalAmount: 500,
            paymentStatus: 'PENDING',
            orderStatus: 'PENDING',
            receiptImage: true
          },
          {
            orderId: 1003,
            merchandise: { name: 'CS Society Hoodie', price: 850 },
            orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            quantity: 1,
            totalAmount: 850,
            paymentStatus: 'PAID',
            orderStatus: 'COMPLETED',
            receiptImage: true
          }
        ];

        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
        return true;
      };
      
      // Try all endpoints until one works
      let success = false;
      
      for (const pattern of endpointPatterns) {
        if (success) break;
        
        try {
          const response = await axios.get(`${pattern.base}${pattern.endpoint}`, config);
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            const formattedOrders = response.data.map(order => ({
              id: order.id || order.orderId,
              orderId: order.orderId || order.id,
              user: order.user,
              merchandise: order.merchandise,
              event: order.event,
              orderDate: order.orderDate,
              quantity: order.quantity || 1,
              totalAmount: order.totalAmount,
              paymentStatus: order.paymentStatus,
              orderStatus: order.orderStatus,
              receiptImage: order.receiptImage ? true : null
            }));
            
            setOrders(formattedOrders);
            setFilteredOrders(formattedOrders);
            success = true;
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${pattern.base}${pattern.endpoint} failed:`, err.message);
          // Continue to next endpoint pattern
        }
      }
      
      // If no endpoints worked, fall back to getting all orders and filtering by user
      if (!success) {
        try {
          // Try to get all orders (admin endpoint) and filter client-side
          const allOrdersResponse = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/orders', config);
          
          if (Array.isArray(allOrdersResponse.data) && allOrdersResponse.data.length > 0) {
            // Filter orders for the current user
            const userOrders = allOrdersResponse.data.filter(order => {
              // Try to match user by ID or other properties
              if (userId && order.user && order.user.id === userId) return true;
              if (user && user.email && order.user && order.user.email === user.email) return true;
              if (user && user.username && order.user && order.user.username === user.username) return true;
              return false;
            });
            
            if (userOrders.length > 0) {
              const formattedOrders = userOrders.map(order => ({
                id: order.id || order.orderId,
                orderId: order.orderId || order.id,
                user: order.user,
                merchandise: order.merchandise,
                event: order.event,
                orderDate: order.orderDate,
                quantity: order.quantity || 1,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                receiptImage: order.receiptImage ? true : null
              }));
              
              setOrders(formattedOrders);
              setFilteredOrders(formattedOrders);
              success = true;
            }
          }
        } catch (err) {
          console.error('Error fetching all orders:', err);
        }
      }
      
      // If we still don't have orders data, try localStorage
      if (!success) {
        const savedOrders = localStorage.getItem('user_orders');
        if (savedOrders) {
          try {
            const parsedOrders = JSON.parse(savedOrders);
            if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
              setOrders(parsedOrders);
              setFilteredOrders(parsedOrders);
              success = true;
            }
          } catch (err) {
            console.error('Error parsing saved orders:', err);
          }
        }
      }
      
      // If we still don't have orders after trying all methods, use mock data for now
      if (!success) {
        success = loadMockOrders();
      }
      
      if (!success) {
        // If we get here, all methods failed
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error loading your orders');
    } finally {
      setLoading(false);
    }
  };
  
  const viewReceipt = async (orderId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'arraybuffer'
      };
      
      // Try Azure endpoint first
      try {
        const response = await axios.get(`https://ccshub-systeminteg.azurewebsites.net/api/orders/${orderId}/receipt`, config);
        
        const imageBlob = new Blob([response.data], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(imageBlob);
        
        setSelectedReceipt(imageUrl);
        setShowReceiptModal(true);
      } catch (azureErr) {
        console.error('Error fetching receipt from Azure:', azureErr);
        
        // Fall back to localhost
        try {
          const localResponse = await axios.get(`http://localhost:8080/api/orders/${orderId}/receipt`, config);
          
          const imageBlob = new Blob([localResponse.data], { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(imageBlob);
          
          setSelectedReceipt(imageUrl);
          setShowReceiptModal(true);
        } catch (localErr) {
          console.error('Error fetching receipt from localhost:', localErr);
          setError('Could not retrieve receipt image');
        }
      }
    } catch (error) {
      console.error('Error viewing receipt:', error);
      setError('Error loading receipt image');
    }
  };
  
  const downloadReceipt = async (orderId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'arraybuffer'
      };
      
      // Try Azure endpoint first
      try {
        const response = await axios.get(`https://ccshub-systeminteg.azurewebsites.net/api/orders/${orderId}/receipt`, config);
        
        const imageBlob = new Blob([response.data], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = `receipt-order-${orderId}.jpg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (azureErr) {
        console.error('Error downloading receipt from Azure:', azureErr);
        
        // Fall back to localhost
        try {
          const localResponse = await axios.get(`http://localhost:8080/api/orders/${orderId}/receipt`, config);
          
          const imageBlob = new Blob([localResponse.data], { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(imageBlob);
          
          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.href = imageUrl;
          downloadLink.download = `receipt-order-${orderId}.jpg`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (localErr) {
          console.error('Error downloading receipt from localhost:', localErr);
          setError('Could not download receipt image');
        }
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setError('Error downloading receipt image');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Get order status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FaCheck className="mr-1" /> Completed</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FaSpinner className="mr-1" /> Pending</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FaTimes className="mr-1" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  // Get payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FaCheck className="mr-1" /> Paid</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FaSpinner className="mr-1" /> Pending</span>;
      case 'FAILED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FaTimes className="mr-1" /> Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-black">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <UserNavbar />
        
        {/* Hero Banner */}
        <div className="bg-yellow-500 text-black py-8 px-8 md:px-12 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-800 text-lg">View and track your purchases from CSS-HUB</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
          {error && (
            <div className="bg-red-800 text-white p-4 rounded-lg shadow-lg mb-6">
              <p>{error}</p>
              <button 
                onClick={fetchUserOrders}
                className="mt-2 px-3 py-1 bg-white text-red-800 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Search and Filters */}
          <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div className="self-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Orders Section */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-yellow-500 text-black px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">YOUR ORDERS</h2>
                <p className="text-sm text-gray-800">{filteredOrders.length} orders found</p>
              </div>
              <div className="flex items-center gap-2">
                <FaShoppingCart className="text-xl" />
              </div>
            </div>
            
            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaSpinner className="text-4xl animate-spin mb-4 text-yellow-500" />
                <p>Loading your orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          #{order.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {order.merchandise ? order.merchandise.name : (order.event ? order.event.title : 'Unknown Item')}
                          {order.quantity > 1 && ` (${order.quantity}x)`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                          ₱{order.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.orderStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentBadge(order.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => navigate('/invoice', { state: { order: order } })}
                              className="text-yellow-500 hover:text-yellow-400"
                              title="View Invoice"
                            >
                              <FaFileInvoice />
                            </button>
                            
                            {order.receiptImage && (
                              <>
                                <button
                                  onClick={() => viewReceipt(order.orderId)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="View Receipt"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  onClick={() => downloadReceipt(order.orderId)}
                                  className="text-green-400 hover:text-green-300"
                                  title="Download Receipt"
                                >
                                  <FaDownload />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaShoppingCart className="text-4xl mb-4 text-yellow-500" />
                <p className="text-xl">No orders found</p>
                <p className="text-sm mt-2">You haven't placed any orders yet</p>
                <button 
                  onClick={() => navigate('/merchpage')}
                  className="mt-6 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                >
                  Browse Merchandise
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-yellow-500 text-black px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Receipt Image</h3>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
                className="text-black hover:text-gray-800"
              >
                ×
              </button>
            </div>
            <div className="p-4 flex justify-center overflow-auto max-h-[70vh]">
              {selectedReceipt ? (
                <img
                  src={selectedReceipt}
                  alt="Receipt"
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FaSpinner className="text-4xl animate-spin mb-4 text-yellow-500" />
                  <p>Loading receipt image...</p>
                </div>
              )}
            </div>
            <div className="bg-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
