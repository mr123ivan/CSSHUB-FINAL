import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAuth } from './AuthProvider';
import axios from 'axios';

// Set up axios with base URL and CORS credentials
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const Invoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { user, isAuthenticated } = useAuth();
  const activeAccount = instance.getActiveAccount();
  
  const [orderCreated, setOrderCreated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  // Get data from location state
  const { item, receiptData, userEmail, userName } = location.state || {};

  if (!item) {
    return <div>Invoice not found!</div>;
  }

  // Format the item details (can be either event or merchandise)
  const isMerch = item.price !== undefined; // Check if it's merchandise (it will have a price)
  
  // Generate a receipt number
  const receiptNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  useEffect(() => {
    // Create order when component mounts
    createOrder();
  }, []);
  
  const createOrder = async () => {
    if (orderCreated) return; // Don't create multiple orders
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Get the actual user ID from authentication context
      let userId;
      
      // First try to get user ID from auth context
      if (isAuthenticated && user && user.userId) {
        userId = user.userId;
      } else {
        // Fall back to localStorage if context doesn't have user info
        const userData = localStorage.getItem('user_data');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            userId = parsedUser.userId || parsedUser.user_id;
          } catch (err) {
            console.error('Error parsing user data from localStorage:', err);
          }
        }
      }
      
      // If we still don't have a user ID, redirect to login
      if (!userId) {
        console.error('No user ID found, redirecting to login');
        setError('Please log in to complete your order.');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      console.log('Using user ID for order:', userId);
      
      console.log('Creating order with item:', item);
      
      // Clean up receipt data - remove data:image prefix if present
      let cleanReceiptData = receiptData;
      if (receiptData && receiptData.includes('base64,')) {
        cleanReceiptData = receiptData.split('base64,')[1];
      }
      
      const orderData = {
        userId: userId,
        merchandiseId: isMerch ? item.id : null,
        eventId: !isMerch ? item.eventId : null,
        totalAmount: isMerch ? item.price : 0, // Events might be free or have a different pricing model
        orderDate: new Date().toISOString(),
        paymentStatus: "Verification Needed",
        orderStatus: "Processing",
        receiptImageBase64: cleanReceiptData
      };
      
      console.log('Sending order data:', { ...orderData, receiptImageBase64: 'TRUNCATED FOR LOGGING' });
      
      // Create the order in the database - no auth required for this endpoint
      const response = await api.post('/api/orders/create', orderData);
      
      console.log('Order created successfully:', response.data);
      
      if (response.data && response.data.orderId) {
        setOrderId(response.data.orderId);
        setOrderCreated(true);
      } else {
        // Handle case where response doesn't contain orderId
        console.warn('Order created but no orderId returned:', response.data);
        setOrderCreated(true); // Still mark as created to prevent duplicate attempts
      }
    } catch (err) {
      console.error('Error creating order:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
        console.error('Error data:', err.response.data);
        setError(`Server error (${err.response.status}): ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        setError("No response received from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDoneClick = () => {
    navigate('/userpage');
  };

  return (
    <div className="min-h-screen bg-yellow-500 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-black mb-6">{isMerch ? item.name : item.title}</h1>

      <div className="bg-black text-white p-6 rounded-lg shadow-md w-full max-w-md font-mono text-sm space-y-4">
        <div>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Receipt No.:</strong> {receiptNumber}</p>
        </div>

        <div>
          <p className="mt-2"><strong>Buyer Information:</strong></p>
          <p>Name: {user?.username || userName || "Anonymous User"}</p>
          <p>Email: {user?.email || userEmail || "Not provided"}</p>
          {orderId && <p>Order ID: {orderId}</p>}
        </div>

        <div>
          <p className="mt-2"><strong>Order Details:</strong></p>
          <p>Item: {isMerch ? item.name : item.title}</p>
          {isMerch ? (
            <>
              <p>Quantity: 1</p>
              <p>Price per Item: ₱{item.price}</p>
            </>
          ) : (
            <p>Date: {item.eventDate}</p>
          )}
          <p><strong>Total Amount: ₱{isMerch ? item.price : (item.price || 'TBD')}</strong></p>
        </div>

        <div>
          <p className="mt-2"><strong>Payment Details:</strong></p>
          <p>Payment Method: GCash</p>
          <p>Payment Status: Verification Needed</p>
        </div>

        <div className="mt-4 text-center text-yellow-300 font-semibold">
          Thank you for your {isMerch ? 'purchase' : 'registration'}!<br />
          Please check your Outlook for claiming schedule.
        </div>

        <div className="text-center text-sm text-gray-300 mt-2">
          For any concerns, please contact us at our FB page.
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-600 text-white rounded text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleDoneClick}
        disabled={isProcessing}
        className={`mt-6 bg-white text-black px-6 py-2 rounded transition font-semibold ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
      >
        {isProcessing ? 'Processing...' : 'Done'}
      </button>
    </div>
  );
};

export default Invoice;
