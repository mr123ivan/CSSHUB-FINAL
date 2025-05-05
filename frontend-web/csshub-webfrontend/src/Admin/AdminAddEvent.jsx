import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLogout from './AdminLogout';
import axios from 'axios';

const AdminAddEvent = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', name);           // Append 'title' instead of 'name'
    formData.append('description', description);
    formData.append('eventDate', date);       // Append 'eventDate' instead of 'date'
    formData.append('location', location);
    if (image) formData.append('imageFile', image); // Append image if available

    try {
      const res = await axios.post('http://localhost:8080/api/events/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Event added successfully!');
      console.log(res.data);
    } catch (error) {
      console.error('Failed to add Event:', error);
      alert('Failed to add Event');
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black p-6 text-black">
        <div className="mb-10">
          <img
            src="/path-to-logo.png"
            alt="CSS Logo"
            className="w-10 h-10 mb-6"
          />
          <h2 className="font-semibold mb-4">Members</h2>
          <ul className="mb-6 space-y-2">
            <li><Link to="/adminmembers" className="hover:underline">Members</Link></li>
          </ul>

          <h2 className="font-semibold mb-4">Events</h2>
          <ul className="mb-6 space-y-2">
            <li><Link to="/adminupcomingevents" className="hover:underline">Upcoming Events</Link></li>
          </ul>

          <h2 className="font-semibold mb-4">Merchandise</h2>
          <ul className="space-y-2">
            <li><Link to="/adminmerch" className="hover:underline">List of Merchandise</Link></li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <AdminLogout />
        <header className="bg-black text-yellow-500 text-center py-4 shadow-md">
          <h1 className="text-2xl font-bold">Computer Students Society</h1>
        </header>

        <section className="p-6">
          <section className="bg-yellow-100 p-8 rounded-2xl shadow-md max-w-2xl mx-auto mt-10 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">ADD EVENT</h2>

            {/* Event Name */}
            <div>
              <label className="block text-gray-700 mb-2">Event Name</label>
              <input 
                type="text" 
                placeholder="Enter event name" 
                value={name}         // Bind state to the input value
                onChange={(e) => setName(e.target.value)} // Update state on change
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-gray-700 mb-2">Event Description</label>
              <input 
                type="text" 
                placeholder="Enter event description" 
                value={description} // Bind state to the input value
                onChange={(e) => setDescription(e.target.value)} // Update state on change
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-gray-700 mb-2">Event Date</label>
              <input 
                type="date" 
                value={date}         // Bind state to the input value
                onChange={(e) => setDate(e.target.value)} // Update state on change
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 mb-2">Location</label>
              <input 
                type="text" 
                placeholder="Enter event location" 
                value={location}     // Bind state to the input value
                onChange={(e) => setLocation(e.target.value)} // Update state on change
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 mb-2">Upload Event Image</label>
              <input 
                type="file" 
                onChange={(e) => setImage(e.target.files[0])} // Update image state when file is selected
                className="w-full text-gray-600 bg-white border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
              />
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmit} // Trigger form submission
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              Submit
            </button>
          </section>
        </section>
      </main>
    </div>
  );
};

export default AdminAddEvent;
