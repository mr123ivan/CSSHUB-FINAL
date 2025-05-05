import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaUpload, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaInfoCircle } from 'react-icons/fa';

const AddEventModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    eventDate: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.location || !formData.eventDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.name);
      data.append('description', formData.description || 'No description provided');
      data.append('location', formData.location);
      data.append('eventDate', formData.eventDate.split('T')[0]); // "YYYY-MM-DD"
      if (formData.image) {
        data.append('imageFile', formData.image);
      }

      const response = await axios.post('http://localhost:8080/api/events/create', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true // Include credentials for authentication
      });

      if (onSuccess) {
        onSuccess(response.data); // backend may return a string or full event object
      }

      setFormData({
        name: '',
        description: '',
        location: '',
        eventDate: '',
        image: null
      });
      setImagePreview(null);
      onClose();
    } catch (err) {
      console.error('Error creating event:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Authentication required. Please log in first.');
        } else if (err.response.data && typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to create event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const now = new Date();
  const minDate = now.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-4 bg-yellow-500 text-black font-bold flex justify-between items-center rounded-t-lg">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2" />
            <span>Add New Event</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-black text-yellow-500 p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
              <p className="flex items-center">
                <FaInfoCircle className="mr-2" />
                {error}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Event Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter event name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-[100px]"
                  placeholder="Enter event description"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Location *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter event location"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Event Date & Time *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClock className="text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    min={minDate}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Event Image</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 h-[220px] flex flex-col items-center justify-center">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, image: null});
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center relative">
                    <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                    <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm">PNG, JPG or JPEG (max. 2MB)</p>
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/png, image/jpeg, image/jpg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                  Saving...
                </>
              ) : (
                <>Add Event</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
