import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthConfig, logoutAdmin } from '../utils/adminAuth';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminActionButtons from '../components/AdminActionButtons';
import { FaCheck, FaTimes, FaSpinner, FaEye, FaDownload } from 'react-icons/fa';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');
  const [filterOrderStatus, setFilterOrderStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters whenever orders or filter settings change
  useEffect(() => {
    applyFilters();
  }, [orders, filterPaymentStatus, filterOrderStatus, searchTerm]);
  
  // Function to apply all active filters
  const applyFilters = () => {
    let result = [...orders];
    
    if (filterPaymentStatus !== 'All') {
      result = result.filter(order => order.paymentStatus === filterPaymentStatus);
    }
    
    if (filterOrderStatus !== 'All') {
      result = result.filter(order => order.orderStatus === filterOrderStatus);
    }
    
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(order => 
        (order.orderId?.toString().toLowerCase().includes(lowercasedSearch)) ||
        (order.user?.username?.toLowerCase().includes(lowercasedSearch)) ||
        (order.user?.email?.toLowerCase().includes(lowercasedSearch)) ||
        (order.merchandise?.name?.toLowerCase().includes(lowercasedSearch)) ||
        (order.event?.name?.toLowerCase().includes(lowercasedSearch)) ||
        (order.event?.title?.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    setFilteredOrders(result);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilterPaymentStatus('All');
    setFilterOrderStatus('All');
    setSearchTerm('');
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const config = getAuthConfig();
    
    try {
      // Try the Azure endpoint first
      const response = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/orders', config);
      
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
      } else {
        setOrders([]);
        setFilteredOrders([]);
        setError('No orders found in the database');
      }
    } catch (azureErr) {
      console.error('Error fetching orders from Azure:', azureErr);
      
      // Fall back to localhost if Azure fails
      try {
        const localResponse = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/orders', config);
        
        if (Array.isArray(localResponse.data) && localResponse.data.length > 0) {
          const formattedOrders = localResponse.data.map(order => ({
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
          setError(null); // Clear any previous errors
        } else {
          setOrders([]);
          setFilteredOrders([]);
          setError('No orders found in the database');
        }
      } catch (localErr) {
        console.error('Error fetching orders from localhost:', localErr);
        if (localErr.response && localErr.response.status === 401) {
          setError('Authentication required. Please log in.');
          logoutAdmin();
          navigate('/adminlogin');
        } else {
          setError('Failed to load orders from server. Please try again later.');
          setOrders([]);
          setFilteredOrders([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const updateData = { orderStatus: status };
      try {
        await axios.put(`https://ccshub-systeminteg.azurewebsites.net/api/orders/edit/${orderId}`, updateData, getAuthConfig());
        alert('Order status updated successfully on server');
      } catch (apiError) {
        console.error('Server update failed, updating UI only:', apiError);
        if (apiError.response && apiError.response.status === 401) {
          setError('Authentication required. Please log in.');
          logoutAdmin();
          navigate('/adminlogin');
          return;
        }
        alert('Backend server requires authentication. Status updated in UI only.');
      }
      
      setOrders(orders.map(order => 
        order.orderId == orderId ? { ...order, orderStatus: status } : order
      ));
      
      try {
        fetchOrders();
      } catch (refreshError) {
        console.warn('Could not refresh orders:', refreshError);
      }
    } catch (err) {
      console.error('Error in update operation:', err);
      alert('Error occurred. Please check console for details.');
    }
  };

  const handleUpdatePayment = async (orderId, status) => {
    try {
      const updateData = { paymentStatus: status };
      try {
        await axios.put(`https://ccshub-systeminteg.azurewebsites.net/api/orders/edit/${orderId}`, updateData, getAuthConfig());
        alert('Payment status updated successfully on server');
      } catch (apiError) {
        console.error('Server update failed, updating UI only:', apiError);
        if (apiError.response && apiError.response.status === 401) {
          setError('Authentication required. Please log in.');
          logoutAdmin();
          navigate('/adminlogin');
          return;
        }
        alert('Backend server requires authentication. Status updated in UI only.');
      }
      
      setOrders(orders.map(order => 
        order.orderId == orderId ? { ...order, paymentStatus: status } : order
      ));
      
      try {
        fetchOrders();
      } catch (refreshError) {
        console.warn('Could not refresh orders:', refreshError);
      }
    } catch (err) {
      console.error('Error in update operation:', err);
      alert('Error occurred. Please check console for details.');
    }
  };

  const handleViewReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const getReceiptImageUrl = (order) => {
    if (!order || !order.receiptImage) {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22600%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23FFCC00%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22200%22%3ENo%20Receipt%3C%2Ftext%3E%3C%2Fsvg%3E';
    }
    
    return `https://ccshub-systeminteg.azurewebsites.net/api/orders/receipt-image/${order.orderId}?time=${new Date().getTime()}`;
  };

  const closeModal = () => {
    setShowReceiptModal(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed':
        return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'Processing':
        return <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full text-xs">Processing</span>;
      case 'Cancelled':
        return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-full text-xs">Cancelled</span>;
      case 'Pending':
        return <span className="bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full text-xs">Pending</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'Paid':
        return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs">Paid</span>;
      case 'Pending':
        return <span className="bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'Verification Needed':
        return <span className="bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full text-xs">Verification Needed</span>;
      case 'Rejected':
        return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Manage Orders" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-yellow-500 mb-2">Order Management</h1>
            <p className="text-gray-400">Manage and process customer orders</p>
          </div>
          
          <AdminActionButtons />
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className={`${error.includes('Authentication') ? 'bg-yellow-900/50 border-yellow-500' : 'bg-red-900/50 border-red-500'} border-l-4 text-gray-100 p-4 mb-6 rounded`}>
              <p className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
              {error.includes('Authentication') && (
                <p className="mt-2 text-sm text-yellow-300">
                  <button 
                    onClick={() => navigate('/adminlogin')} 
                    className="underline hover:text-yellow-200"
                  >
                    Go to Login
                  </button>
                </p>
              )}
            </div>
          )}
          
          {/* Orders Table */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center">
              <span>Orders List</span>
              <div className="flex gap-2">
                <button 
                  onClick={fetchOrders} 
                  className="bg-black text-yellow-500 px-3 py-1 rounded-full text-sm hover:bg-gray-800 transition-colors"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => {
                    logoutAdmin();
                    navigate('/adminlogin');
                  }} 
                  className="bg-red-800 text-white px-3 py-1 rounded-full text-sm hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            
            {/* Filters Section */}
            <div className="p-4 bg-gray-700 border-b border-gray-600">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Search Box */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Filter Dropdowns */}
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <select
                      value={filterPaymentStatus}
                      onChange={(e) => setFilterPaymentStatus(e.target.value)}
                      className="bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="All">All Payments</option>
                      <option value="Pending">Pending</option>
                      <option value="Verification Needed">Verification Needed</option>
                      <option value="Paid">Paid</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={filterOrderStatus}
                      onChange={(e) => setFilterOrderStatus(e.target.value)}
                      className="bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="All">All Orders</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Shipped">Shipped</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="bg-gray-800 text-gray-300 hover:text-white border border-gray-600 rounded px-3 py-2 focus:outline-none hover:bg-gray-700 transition-colors"
                    title="Reset all filters"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Filter stats */}
              <div className="mt-3 text-sm text-gray-400">
                Showing {filteredOrders.length} of {orders.length} orders
                {(filterPaymentStatus !== 'All' || filterOrderStatus !== 'All' || searchTerm) && (
                  <span> • Filtered by: {filterPaymentStatus !== 'All' ? `Payment: ${filterPaymentStatus}` : ''} 
                  {filterOrderStatus !== 'All' ? (filterPaymentStatus !== 'All' ? ' | ' : '') + `Order: ${filterOrderStatus}` : ''}
                  {searchTerm ? (filterPaymentStatus !== 'All' || filterOrderStatus !== 'All' ? ' | ' : '') + `Search: "${searchTerm}"` : ''}
                  </span>
                )}
              </div>
              
              {/* Authentication note for admin */}
              {error && error.includes('Authentication') && (
                <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-sm text-yellow-400">
                  <p className="flex items-center">
                    <span className="mr-2">ℹ️</span>
                    <span>
                      <strong>Note for Admin:</strong> Please sign in to enable database updates.
                      <button 
                        onClick={() => navigate('/adminlogin')} 
                        className="ml-2 underline hover:text-yellow-300"
                      >
                        Sign In
                      </button>
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-700/50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">#{order.orderId}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {order.user?.username || 'Anonymous'}
                          <div className="text-xs text-gray-500">{order.user?.email || 'No email'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {order.merchandise ? (
                            <span className="text-yellow-400">{order.merchandise.name}</span>
                          ) : order.event ? (
                            <span className="text-green-400">{order.event.name || order.event.title}</span>
                          ) : (
                            'Unknown Item'
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(order.orderDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">₱{order.totalAmount}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(order.orderStatus)}
                        </td>
                      </tr>
                    ))
                  ) : !loading && orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No orders found in the database
                      </td>
                    </tr>
                  ) : !loading && filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No orders match the current filters
                        <div className="mt-2">
                          <button 
                            onClick={resetFilters}
                            className="px-3 py-1 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      
      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
            <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center rounded-t-lg">
              <span>Receipt for Order #{selectedOrder.orderId}</span>
              <div className="flex gap-2">
                <a 
                  href={getReceiptImageUrl(selectedOrder)} 
                  download={`receipt-order-${selectedOrder.orderId}.jpg`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black text-yellow-500 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </a>
                <button 
                  onClick={closeModal}
                  className="bg-black text-yellow-500 px-3 py-1 rounded-full text-sm hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center">
                <img 
                  src={getReceiptImageUrl(selectedOrder)} 
                  alt="Receipt" 
                  className="max-h-96 object-contain mb-4 border border-gray-700 rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22600%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23FFCC00%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22200%22%3ENo%20Receipt%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
                {selectedOrder.receiptImage && (
                  <a 
                    href={getReceiptImageUrl(selectedOrder)} 
                    download={`receipt-order-${selectedOrder.orderId}.jpg`}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload className="mr-2" /> Download Receipt
                  </a>
                )}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-b-lg">
              <h3 className="font-bold text-yellow-500 mb-2">Order Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Customer:</p>
                  <p className="text-white">{selectedOrder.user?.username || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date:</p>
                  <p className="text-white">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Item:</p>
                  <p className="text-white">
                    {selectedOrder.merchandise ? selectedOrder.merchandise.name : 
                     selectedOrder.event ? (selectedOrder.event.name || selectedOrder.event.title) : 'Unknown Item'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Amount:</p>
                  <p className="text-yellow-400 font-bold">₱{selectedOrder.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-400">Payment Status:</p>
                  <p>{getPaymentStatusBadge(selectedOrder.paymentStatus)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Order Status:</p>
                  <p>{getStatusBadge(selectedOrder.orderStatus)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;