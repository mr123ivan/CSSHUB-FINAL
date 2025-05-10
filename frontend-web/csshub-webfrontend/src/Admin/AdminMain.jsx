import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminActionButtons from '../components/AdminActionButtons';
import { FaUser, FaCalendarAlt, FaTshirt, FaShoppingCart, FaUserCheck, FaEnvelope } from 'react-icons/fa';
import { getAuthConfig, logoutAdmin } from '../utils/adminAuth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State for analytics data
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Analytics metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalMerchandise: 0,
    totalOrders: 0,
    pendingPayments: 0
  });
  
  // Analytics for event participation and merchandise purchases
  const [eventAnalytics, setEventAnalytics] = useState([]);
  const [merchAnalytics, setMerchAnalytics] = useState([]);
  
  useEffect(() => {
    // Fetch all required data
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data with authentication headers
        const config = getAuthConfig();
        
        // Use separate try-catch for each request to handle partial failures
        let usersData = [], eventsData = [], merchandiseData = [], ordersData = [];
        
        try {
          // Try the Azure endpoint first
          const usersResponse = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/users', config);
          usersData = usersResponse.data || [];
          setUsers(usersData);
        } catch (usersErr) {
          console.error('Error fetching users from Azure:', usersErr);
          // Fall back to localhost if Azure fails
          try {
            const localResponse = await axios.get('http://localhost:8080/api/users', config);
            usersData = localResponse.data || [];
            setUsers(usersData);
          } catch (localErr) {
            console.error('Error fetching users from localhost:', localErr);
            setUsers([]);
          }
        }
        
        try {
          const eventsResponse = await axios.get('http://localhost:8080/api/events', config);
          eventsData = eventsResponse.data || [];
          setEvents(eventsData);
        } catch (eventsErr) {
          console.error('Error fetching events:', eventsErr);
          setEvents([]);
        }
        
        try {
          const merchandiseResponse = await axios.get('http://localhost:8080/api/merchandises', config);
          merchandiseData = merchandiseResponse.data || [];
          setMerchandise(merchandiseData);
        } catch (merchErr) {
          console.error('Error fetching merchandise:', merchErr);
          setMerchandise([]);
        }
        
        try {
          const ordersResponse = await axios.get('http://localhost:8080/api/orders', config);
          ordersData = ordersResponse.data || [];
          setOrders(ordersData);
        } catch (ordersErr) {
          console.error('Error fetching orders:', ordersErr);
          setOrders([]);
        }
        
        // Calculate metrics
        const pendingPayments = ordersData.filter(order => 
          order.paymentStatus === 'Pending' || order.paymentStatus === 'Verification Needed'
        ).length;
        
        setMetrics({
          totalUsers: usersData.length,
          totalEvents: eventsData.length,
          totalMerchandise: merchandiseData.length,
          totalOrders: ordersData.length,
          pendingPayments
        });
        
        // Calculate event participation
        const eventMap = new Map();
        eventsData.forEach(event => {
          eventMap.set(event.eventId, { 
            ...event, 
            participantCount: 0,
            participants: []
          });
        });
        
        ordersData.forEach(order => {
          if (order.event && eventMap.has(order.event.eventId)) {
            const eventData = eventMap.get(order.event.eventId);
            eventData.participantCount++;
            if (order.user) {
              eventData.participants.push(order.user);
            }
            eventMap.set(order.event.eventId, eventData);
          }
        });
        
        setEventAnalytics(Array.from(eventMap.values()));
        
        // Calculate merchandise purchases
        const merchMap = new Map();
        merchandiseData.forEach(merch => {
          merchMap.set(merch.id, { 
            ...merch, 
            purchaseCount: 0,
            purchasers: []
          });
        });
        
        ordersData.forEach(order => {
          if (order.merchandise && merchMap.has(order.merchandise.id)) {
            const merchData = merchMap.get(order.merchandise.id);
            merchData.purchaseCount++;
            if (order.user) {
              merchData.purchasers.push(order.user);
            }
            merchMap.set(order.merchandise.id, merchData);
          }
        });
        
        setMerchAnalytics(Array.from(merchMap.values()));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response && err.response.status === 401) {
          setError('Authentication required. Please log in.');
          logoutAdmin();
          navigate('/adminlogin');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Dashboard Overview" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome to the CSS-HUB admin dashboard. Here's an overview of your system.</p>
          </div>
          
          <AdminActionButtons 
            onEventAdded={(newEvent) => {
              setEvents([newEvent, ...events]);
              setMetrics(prev => ({
                ...prev,
                totalEvents: prev.totalEvents + 1
              }));
            }}
            onMerchAdded={(newMerch) => {
              setMerchandise([newMerch, ...merchandise]);
              setMetrics(prev => ({
                ...prev,
                totalMerchandise: prev.totalMerchandise + 1
              }));
            }}
          />
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
            </div>
          )}
          
          {/* Error message if API fails */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
              {error.includes('Authentication') && (
                <button 
                  onClick={() => navigate('/adminlogin')} 
                  className="mt-2 underline text-blue-600 hover:text-blue-800"
                >
                  Go to Login
                </button>
              )}
            </div>
          )}
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="p-1 bg-blue-500"></div>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-500/20 mr-4">
                    <FaUser className="text-blue-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">{loading ? '...' : metrics.totalUsers}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Events Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="p-1 bg-green-500"></div>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500/20 mr-4">
                    <FaCalendarAlt className="text-green-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Events</p>
                    <p className="text-2xl font-bold text-white">{loading ? '...' : metrics.totalEvents}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Merchandise Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="p-1 bg-yellow-500"></div>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-500/20 mr-4">
                    <FaTshirt className="text-yellow-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Merchandise</p>
                    <p className="text-2xl font-bold text-white">{loading ? '...' : metrics.totalMerchandise}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Orders Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="p-1 bg-purple-500"></div>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-500/20 mr-4">
                    <FaShoppingCart className="text-purple-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{loading ? '...' : metrics.totalOrders}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pending Payments Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="p-1 bg-red-500"></div>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-500/20 mr-4">
                    <FaUserCheck className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Pending Payments</p>
                    <p className="text-2xl font-bold text-white">{loading ? '...' : metrics.pendingPayments}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Events List with Registration Counts */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <h3 className="bg-yellow-500 text-black px-4 py-3 font-bold sticky top-0 z-10 flex items-center justify-between">
                <span>Events with Registration Counts</span>
                <span className="text-xs bg-black text-yellow-500 px-2 py-1 rounded-full">{eventAnalytics.length}</span>
              </h3>
              <div className="p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : eventAnalytics.length > 0 ? (
                  <div className="space-y-3">
                    {eventAnalytics.map((event) => (
                      <div key={event.eventId} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-white">{event.title || event.name}</div>
                          <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                            {event.participantCount} {event.participantCount === 1 ? 'participant' : 'participants'}
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">{event.location || 'No location specified'}</div>
                        <div className="text-gray-400 text-xs mt-2">
                          <span className="text-yellow-500">Date:</span> {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                        <div className="mt-3">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-yellow-500 hover:text-yellow-400 transition-colors">
                              View Participants
                            </summary>
                            <div className="pl-3 mt-2 border-l-2 border-yellow-500/50 text-gray-300 space-y-1 py-1">
                              {event.participants.length > 0 ? (
                                event.participants.map((user, idx) => (
                                  <div key={idx} className="text-xs">
                                    {user.username} <span className="text-gray-500">({user.email})</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 text-xs">No participants yet</div>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No events found</div>
                )}
              </div>
            </div>

            {/* Merchandise with Purchase Counts */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <h3 className="bg-yellow-500 text-black px-4 py-3 font-bold sticky top-0 z-10 flex items-center justify-between">
                <span>Merchandise with Purchase Counts</span>
                <span className="text-xs bg-black text-yellow-500 px-2 py-1 rounded-full">{merchAnalytics.length}</span>
              </h3>
              <div className="p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : merchAnalytics.length > 0 ? (
                  <div className="space-y-3">
                    {merchAnalytics.map((merch) => (
                      <div key={merch.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-white">{merch.name}</div>
                          <div className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                            {merch.purchaseCount} {merch.purchaseCount === 1 ? 'purchase' : 'purchases'}
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">₱{merch.price}</div>
                        <div className="text-gray-400 text-xs mt-2">
                          <span className="text-yellow-500">Stock:</span> {merch.stock}
                        </div>
                        <div className="mt-3">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-yellow-500 hover:text-yellow-400 transition-colors">
                              View Purchasers
                            </summary>
                            <div className="pl-3 mt-2 border-l-2 border-yellow-500/50 text-gray-300 space-y-1 py-1">
                              {merch.purchasers && merch.purchasers.length > 0 ? (
                                merch.purchasers.map((user, idx) => (
                                  <div key={idx} className="text-xs">
                                    {user.username} <span className="text-gray-500">({user.email})</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 text-xs">No purchases yet</div>
                              )}
                            </div>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No merchandise found</div>
                )}
              </div>
            </div>

            {/* User Registration List */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <h3 className="bg-yellow-500 text-black px-4 py-3 font-bold sticky top-0 z-10 flex items-center justify-between">
                <span>User Registrations</span>
                <span className="text-xs bg-black text-yellow-500 px-2 py-1 rounded-full">{users.length}</span>
              </h3>
              <div className="p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.userId} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="font-semibold text-white flex items-center">
                            <FaUser className="mr-2 text-yellow-500" />
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-400">{user.role || 'Member'}</div>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          <FaEnvelope className="inline-block mr-1 text-xs" /> 
                          {user.email}
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                          <div>
                            <span className="text-yellow-500">Registered:</span>{' '}
                            <span className="text-gray-300">
                              {new Date(user.registrationDate || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            {user.microsoftId ? (
                              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Microsoft Auth</span>
                            ) : (
                              <span className="bg-gray-600 text-gray-400 px-2 py-1 rounded-full">Manual Registration</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No users found</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;