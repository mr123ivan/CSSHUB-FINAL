import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import UserNavbar from '../components/UserNavbar';
import { useMsal } from '@azure/msal-react';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaSpinner, FaSearch } from 'react-icons/fa';

  const EventPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const userName = activeAccount?.name || 'User';

    useEffect(() => {
      fetchEvents();
    }, []);

    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Try Azure endpoint first
        try {
          const response = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/events');
          setEvents(response.data);
        } catch (azureError) {
          console.error('Error fetching from Azure:', azureError);
          // Fall back to localhost
          const localResponse = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/events');
          setEvents(localResponse.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Filter events based on search term
    const filteredEvents = events.filter(event => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (event.title && event.title.toLowerCase().includes(searchTermLower)) ||
        (event.description && event.description.toLowerCase().includes(searchTermLower))
      );
    });
    
    // Format date for better display
    const formatEventDate = (dateString) => {
      if (!dateString) return 'Date TBA';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateString; // Fallback to original string if parsing fails
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">CSS-HUB Events</h1>
              <p className="text-gray-800 text-lg">Discover upcoming events, workshops, and gatherings for Computer Science Society members</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
            
            {/* Search Bar */}
            <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
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
            
            {/* Events Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-yellow-500 text-black px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">UPCOMING EVENTS</h2>
                  <p className="text-sm text-gray-800">{filteredEvents.length} events found</p>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-xl" />
                </div>
              </div>
              
              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FaSpinner className="text-4xl animate-spin mb-4 text-yellow-500" />
                  <p>Loading events...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="p-6 space-y-6">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.eventId}
                      onClick={() => navigate('/productpreview', { state: { event: event } })}
                      className="bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-gray-600 cursor-pointer border border-gray-600"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                          <img
                            src={`https://ccshub-systeminteg.azurewebsites.net/api/events/image/${event.eventId}`}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/300x200/333333/FFCC00?text=${encodeURIComponent(event.title || 'CSS Event')}`;
                            }}
                          />
                          <div className="absolute top-0 left-0 bg-yellow-500 text-black text-xs px-2 py-1 m-2 rounded">
                            <FaCalendarAlt className="inline-block mr-1" />
                            {new Date(event.eventDate) > new Date() ? 'Upcoming' : 'Past Event'}
                          </div>
                        </div>
                        
                        <div className="p-6 md:w-2/3">
                          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-gray-300 mb-4">{event.description}</p>
                          
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center text-gray-400">
                              <FaClock className="mr-2 text-yellow-500" />
                              <span>{formatEventDate(event.eventDate)}</span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center text-gray-400">
                                <FaMapMarkerAlt className="mr-2 text-yellow-500" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <button 
                              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/productpreview', { state: { event: event } });
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FaCalendarAlt className="text-4xl mb-4 text-yellow-500" />
                  <p className="text-xl">No events found</p>
                  <p className="text-sm mt-2">Try a different search term or check back later</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default EventPage;
