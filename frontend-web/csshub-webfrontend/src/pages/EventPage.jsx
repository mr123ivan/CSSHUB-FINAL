import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import UserNavbar from '../components/UserNavbar';
import { useMsal } from '@azure/msal-react';

  const EventPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
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
        const response = await axios.get('http://localhost:8080/api/events'); // Replace with your API URL
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <Sidebar userName={userName} />

        {/* Main Content */}
        <div className="flex-1 bg-yellow-500 flex flex-col">
          {/* Navbar */}
          <UserNavbar />

          {/* Scrollable Events Section */}
          <div className="p-6 text-black flex-1 overflow-y-auto max-h-[calc(100vh-5rem)]">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>

            {loading ? (
              <p>Loading events...</p>
            ) : (
              <div className="space-y-4">
              {events.length > 0 ? (
  events.map((event) => (
    <div
      key={event.eventId} // ✅
      onClick={() => navigate('/productpreview', { state: { event: event } })}
      className="bg-white rounded-lg shadow p-4 flex gap-4 cursor-pointer hover:bg-gray-100 transition"
    >
      <img
        src={`http://localhost:8080/api/events/image/${event.eventId}`} // ✅
        alt={event.title}
        className="w-24 h-24 object-cover rounded-md"
      />
      <div>
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm text-gray-700">{event.description}</p>
        <p className="text-sm text-gray-500 mt-2">Date: {event.eventDate}</p> {/* ✅ */}
      </div>
    </div>
  ))
) : (
  <p>No events found.</p>
)}


              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default EventPage;
