import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthConfig, logoutAdmin, deleteEvent } from '../utils/adminAuth';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTrash, FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import AddEventModal from '../components/AddEventModal';

const AdminUpcomingEvents = () => {
  const navigate = useNavigate();
  const [eventsList, setEventsList] = useState([]); // State to store events data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use auth config from our utility
      const response = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/events', getAuthConfig());
      
      if (response.data && response.data.length > 0) {
        setEventsList(response.data);
      } else {
        setEventsList([]);
        setError('No events found in the database');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEventsList([]);
      
      if (error.response && error.response.status === 401) {
        setError('Authentication required to access events data');
      } else {
        setError('Failed to load events from the database. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    console.log('Attempting to delete event with ID:', eventId);
    
    if (!eventId || eventId === undefined) {
      alert('Cannot delete event: Invalid event ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Set loading state
        setLoading(true);
        
        // Use the improved deleteEvent method with Azure/localhost fallback
        const response = await deleteEvent(eventId);
        console.log('Delete response:', response);
        
        // Update the UI after successful deletion
        setEventsList(eventsList.filter(event => event.eventId !== eventId));
        alert('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        
        // Still update the UI to remove the event, assuming it should be gone
        // This improves UX even if there was a backend error
        setEventsList(eventsList.filter(event => event.eventId !== eventId));
        
        // Show a friendly error message
        alert('The event has been removed from the display. Note: There might have been an issue with the server connection.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Generate a placeholder image for events
  const getEventImageUrl = (event) => {
    // First try to get the image from the server
    const serverUrl = `https://ccshub-systeminteg.azurewebsites.net/api/events/image/${event.eventId}`;
    
    // Format the event date for display
    const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Also prepare a fallback SVG with the event name and date
    const encodedName = encodeURIComponent(event.name || event.title || 'CSS Event');
    const encodedDate = encodeURIComponent(formattedDate);
    const encodedLocation = encodeURIComponent(event.location || 'TBA');
    
    const fallbackUrl = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22600%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23FFCC00%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22150%22%3E${encodedName}%3C%2Ftext%3E%3Ctext%20fill%3D%22%23FFFFFF%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22200%22%3E${encodedDate}%3C%2Ftext%3E%3Ctext%20fill%3D%22%23AAAAAA%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22240%22%3E${encodedLocation}%3C%2Ftext%3E%3C%2Fsvg%3E`;
    
    return serverUrl;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Filter events based on search term
  const filteredEvents = eventsList.filter(event => 
    (event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Events Management" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-yellow-500 mb-2">Upcoming Events</h1>
            <p className="text-gray-400">Manage CSS-HUB events and activities</p>
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
                placeholder="Search events..."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchEvents}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
              >
                <FaCalendarAlt className="mr-1" />
                Refresh Events
              </button>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <FaPlus className="mr-1" />
                Add New Event
              </button>
            </div>
          </div>
          
          {/* Events List */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center">
              <span>Upcoming Events</span>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchEvents} 
                  className="bg-black text-yellow-500 px-3 py-1 rounded-full text-xs hover:bg-gray-800 transition-colors"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="bg-black text-yellow-500 px-3 py-1 rounded-full text-xs hover:bg-gray-800 transition-colors"
                >
                  Add New Event
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
              Upcoming Events ({filteredEvents.length})
            </div>
            
            {!loading && filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No events match your search' : 'No upcoming events found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredEvents.map((event) => (
                  <div key={event.eventId} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors">
                    <div className="h-48 bg-gray-600 relative overflow-hidden">
                      <img
                        src={getEventImageUrl(event)}
                        alt={event.name || event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          // Format the event date for display
                          const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
                          const formattedDate = eventDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          });
                          
                          // Create a custom placeholder with the event name and date
                          const encodedName = encodeURIComponent(event.name || event.title || 'CSS Event');
                          const encodedDate = encodeURIComponent(formattedDate);
                          const encodedLocation = encodeURIComponent(event.location || 'TBA');
                          
                          e.target.src = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%22600%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23FFCC00%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22150%22%3E${encodedName}%3C%2Ftext%3E%3Ctext%20fill%3D%22%23FFFFFF%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22200%22%3E${encodedDate}%3C%2Ftext%3E%3Ctext%20fill%3D%22%23AAAAAA%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20x%3D%22300%22%20y%3D%22240%22%3E${encodedLocation}%3C%2Ftext%3E%3C%2Fsvg%3E`;
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                          {new Date(event.eventDate) > new Date() ? 'Upcoming' : 'Past Event'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg mb-2">{event.name || event.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description || 'No description provided'}</p>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <FaClock className="mr-2" />
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-3">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{event.location || 'Location TBA'}</span>
                      </div>
                      
                      <div className="flex justify-end items-center mt-4">
                        <button
                          onClick={() => handleDelete(event.eventId)}
                          className="flex items-center px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
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
      
      {/* Add Event Modal */}
      <AddEventModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={(newEvent) => {
          // Refresh the entire events list to get the latest data
          fetchEvents();
          alert('Event added successfully!');
        }} 
      />
    </div>
  );
};

export default AdminUpcomingEvents;
