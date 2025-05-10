import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthConfig, logoutAdmin } from '../utils/adminAuth';

import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { FaCheck, FaTimes, FaSpinner, FaEye, FaDownload, FaMoneyBillWave } from 'react-icons/fa';

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, filterStatus, searchTerm]);
  
  const applyFilters = () => {
    let result = [...payments];
    
    if (filterStatus !== 'All') {
      result = result.filter(payment => payment.status === filterStatus);
    }
    
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(payment => 
        (payment.id?.toString().toLowerCase().includes(lowercasedSearch)) ||
        (payment.orderId?.toString().toLowerCase().includes(lowercasedSearch)) ||
        (payment.username?.toLowerCase().includes(lowercasedSearch)) ||
        (payment.paymentMethod?.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    setFilteredPayments(result);
  };
  
  const resetFilters = () => {
    setFilterStatus('All');
    setSearchTerm('');
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get payments from orders with the auth config
      const response = await axios.get('http://localhost:8080/api/orders', getAuthConfig());
      
      if (response.data && response.data.length > 0) {
        // Transform orders into payment records
        const paymentRecords = response.data.map(order => ({
          id: order.orderId,
          orderId: order.orderId,
          username: order.user?.username || 'Anonymous',
          date: order.orderDate,
          amount: order.totalAmount,
          paymentMethod: 'Gcash', // Assumption based on the system
          status: order.paymentStatus,
          receiptUrl: `http://localhost:8080/api/orders/receipt/${order.orderId}`
        }));
        
        setPayments(paymentRecords);
        setFilteredPayments(paymentRecords);
      } else {
        setPayments([]);
        setFilteredPayments([]);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payment data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const closeModal = () => {
    setShowReceiptModal(false);
    setSelectedPayment(null);
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      // Get the corresponding order ID (in this case they're the same)
      const orderId = paymentId;
      
      // Update the order's payment status
      await axios.put(`http://localhost:8080/api/orders/edit/${orderId}`, {
        paymentStatus: newStatus
      }, getAuthConfig());
      
      // Update local state
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: newStatus } 
            : payment
        )
      );
      
      // Refresh payments list
      fetchPayments();
    } catch (err) {
      console.error('Error updating payment status:', err);
      // Update UI even if server request fails
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: newStatus } 
            : payment
        )
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded">Verified</span>;
      case 'Pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">Pending</span>;
      case 'Failed':
        return <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-500 rounded">{status}</span>;
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
        <AdminHeader title="Payment Management" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-yellow-500 mb-2">Payment Verification</h1>
            <p className="text-gray-400">Manage and verify payment receipts</p>
          </div>
          
          {/* Action Buttons */}
          <div className="mb-6 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center">
              <span>Payment Records</span>
              <div className="flex gap-2">
                <button 
                  onClick={fetchPayments}
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
                    placeholder="Search payments..."
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
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="bg-gray-800 text-gray-300 border border-gray-600 rounded px-4 py-2 hover:bg-gray-700 focus:outline-none"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              {/* Filter stats */}
              <div className="mt-3 text-sm text-gray-400">
                Showing {filteredPayments.length} of {payments.length} payments
                {(filterStatus !== 'All' || searchTerm) && (
                  <span> • Filtered by: {filterStatus !== 'All' ? `Status: ${filterStatus}` : ''} 
                  {searchTerm ? (filterStatus !== 'All' ? ' | ' : '') + `Search: "${searchTerm}"` : ''}
                  </span>
                )}
              </div>
            </div>
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center items-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            )}
            
            {/* Error display */}
            {error && (
              <div className="bg-red-900/50 border-l-4 border-red-500 text-gray-100 p-4 m-4 rounded">
                <p className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">#{payment.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">#{payment.orderId}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{payment.username}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(payment.date)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">₱{payment.amount}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className="flex items-center">
                            <FaMoneyBillWave className="mr-2 text-green-400" />
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                          <button 
                            onClick={() => handleViewReceipt(payment)} 
                            className="bg-blue-500/20 text-blue-400 p-1.5 rounded hover:bg-blue-500/30 transition-colors"
                            title="View Receipt"
                          >
                            <FaEye />
                          </button>
                          
                          <div className="inline-block relative group">
                            <button 
                              className="bg-purple-500/20 text-purple-400 p-1.5 rounded hover:bg-purple-500/30 transition-colors"
                              title="Actions"
                            >
                              •••
                            </button>
                            <div className="hidden group-hover:block absolute right-0 z-10 w-48 mt-2 bg-gray-800 rounded-md shadow-lg border border-gray-700">
                              <div className="py-1">
                                <button 
                                  onClick={() => handleUpdatePaymentStatus(payment.id, 'Verified')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                  disabled={payment.status === 'Verified'}
                                >
                                  Verify Payment
                                </button>
                                <button 
                                  onClick={() => handleUpdatePaymentStatus(payment.id, 'Pending')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                  disabled={payment.status === 'Pending'}
                                >
                                  Mark as Pending
                                </button>
                                <button 
                                  onClick={() => handleUpdatePaymentStatus(payment.id, 'Failed')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                  disabled={payment.status === 'Failed'}
                                >
                                  Mark as Failed
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        {loading ? 'Loading payments...' : 'No payments found matching the current filters'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      
      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
            <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center rounded-t-lg">
              <span>Receipt for Payment #{selectedPayment.id}</span>
              <div className="flex gap-2">
                <a 
                  href={selectedPayment.receiptUrl} 
                  download={`receipt-payment-${selectedPayment.id}.jpg`}
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
                  src={selectedPayment.receiptUrl} 
                  alt="Receipt" 
                  className="max-h-96 object-contain mb-4 border border-gray-700 rounded"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/333/yellow?text=No+Receipt+Image';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-gray-400">Customer:</p>
                  <p className="text-white">{selectedPayment.username}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date:</p>
                  <p className="text-white">{formatDate(selectedPayment.date)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Payment Method:</p>
                  <p className="text-white">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-400">Amount:</p>
                  <p className="text-yellow-400 font-bold">₱{selectedPayment.amount}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status:</p>
                  <p>{getStatusBadge(selectedPayment.status)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Order ID:</p>
                  <p className="text-white">#{selectedPayment.orderId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
