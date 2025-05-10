import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UserNavbar from '../components/UserNavbar';
import api from '../services/api';
import { useAuth } from './AuthProvider';
import { FaCalendarAlt, FaTshirt, FaArrowRight, FaMapMarkerAlt, FaClock, FaDollarSign, FaSignInAlt } from 'react-icons/fa';

const UserPage = () => {
  const [events, setEvents] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use separate try-catch blocks for each request to handle partial failures
        try {
          const eventsResponse = await api.get('/api/events');
          setEvents(eventsResponse.data);
        } catch (eventsErr) {
          console.error('Error fetching events:', eventsErr);
          setEvents([]);
        }
        
        try {
          const merchandiseResponse = await api.get('/api/merchandises');
          setMerchandise(merchandiseResponse.data);
        } catch (merchErr) {
          console.error('Error fetching merchandise:', merchErr);
          setMerchandise([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
        setError('Failed to load content. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const baseImageUrl = process.env.NODE_ENV === 'development'
    ? 'https://ccshub-systeminteg.azurewebsites.net/api'
    : 'https://ccshub-systeminteg.azurewebsites.net/api';

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-b from-yellow-400 to-yellow-600 flex flex-col">
        <UserNavbar />
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="bg-black/80 text-white rounded-lg p-6 mb-8 shadow-lg flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {isAuthenticated && user ? user.username : 'Guest'}!</h1>
              <p className="text-yellow-400">Explore upcoming events and merchandise from the Computer Studies Society.</p>
            </div>
            {!isAuthenticated && (
              <div className="ml-4">
                <Link 
                  to="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('button.px-4.py-2.bg-yellow-500').click();
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center"
                >
                  <FaSignInAlt className="mr-2" /> Login to Order
                </Link>
              </div>
            )}
          </div>
          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black flex items-center">
                <FaCalendarAlt className="mr-2" /> Upcoming Events
              </h2>
              <Link to="/eventpage" className="bg-black text-yellow-400 px-4 py-2 rounded-full flex items-center hover:bg-gray-800 transition-colors">
                View All <FaArrowRight className="ml-2" />
              </Link>
            </div>
            {!loading && events.length === 0 ? (
              <div className="bg-white/80 rounded-lg p-6 text-center">
                <p className="text-gray-600">No upcoming events at the moment. Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 3).map((event) => (
                  <div key={event.eventId} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <img
                      src={`${baseImageUrl}/events/image/${event.eventId}`}
                      alt={event.title || event.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400/333/yellow?text=CSS+Event';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{event.title || event.name}</h3>
                      <div className="float-left mr-3 text-gray-600 mb-2">
                        <FaMapMarkerAlt className="mr-1 inline-block" />
                        <span>{event.location || 'TBA'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <FaClock className="mr-1" />
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{event.description || 'Join us for this exciting event!'}</p>
                      <Link to={`/eventdetailpage/${event.eventId}`} className="block text-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors">
                        Learn More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black flex items-center">
                <FaTshirt className="mr-2" /> Featured Merchandise
              </h2>
              <Link to="/merchpage" className="bg-black text-yellow-400 px-4 py-2 rounded-full flex items-center hover:bg-gray-800 transition-colors">
                View All <FaArrowRight className="ml-2" />
              </Link>
            </div>
            {!loading && merchandise.length === 0 ? (
              <div className="bg-white/80 rounded-lg p-6 text-center">
                <p className="text-gray-600">No merchandise available at the moment. Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {merchandise.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <img
                      src={`${baseImageUrl}/merchandises/image/${item.id}`}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400/333/yellow?text=CSS+Merch';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                      <div className="flex items-center text-gray-700 mb-4">
                        <FaDollarSign className="mr-1" />
                        <span className="text-xl font-bold">₱{item.price}</span>
                      </div>
                      <Link to={`/productpreview/${item.id}`} className="block text-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




export default UserPage;