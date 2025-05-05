import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLogout from './AdminLogout';
import { addMerchandise } from '../utils/adminAuth';

const AdminAddMerch = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [stock, setStock] = useState('');


  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate form
    if (!name || !price || !stock) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('price', parseFloat(price));
    formData.append('stock', parseInt(stock));
    
    // Append image if it exists
    if (image) {
      formData.append('imageFile', image);
    }

    try {
      // Use our direct authentication method to add merchandise
      const response = await addMerchandise(formData);
      
      alert('Merchandise added successfully!');
      console.log('Merchandise added:', response.data);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImage(null);
      
      // Redirect back to merch list
      navigate('/adminmerch');
    } catch (error) {
      console.error('Failed to add merchandise:', error);
      
      if (error.message === 'Authentication required' || 
          (error.response && error.response.status === 401)) {
        setError('Authentication required. Please log in again.');
        navigate('/adminlogin', { state: { from: '/adminaddmerch' } });
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection to the server.');
      } else {
        setError('Failed to add merchandise. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
      <AdminLogout/>
        <header className="bg-black text-yellow-500 text-center py-4 shadow-md">
          <h1 className="text-2xl font-bold">Computer Students Society</h1>
        </header>
        <section className="p-6">
  {error && (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 max-w-2xl mx-auto mt-10 rounded">
      <p className="font-medium">{error}</p>
    </div>
  )}
        
  <form
    onSubmit={handleSubmit}
    className="bg-yellow-100 p-8 rounded-2xl shadow-md max-w-2xl mx-auto mt-4 space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-800">Add Merchandise</h2>

    <div>
      <label className="block text-gray-700 mb-2">Name of merch</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3"
        placeholder="Enter merch name"
      />
    </div>

    <div>
      <label className="block text-gray-700 mb-2">Merch Description</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3"
        placeholder="Enter merch description"
      />
    </div>

    <div>
      <label className="block text-gray-700 mb-2">Price</label>
      <input
        type="text"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3"
        placeholder="Enter merch price"
      />
    </div>

    {/* 🔢 Stock Input */}
    <div>
      <label className="block text-gray-700 mb-2">Stock Available</label>
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3"
        placeholder="Enter stock quantity"
        min="0"
      />
    </div>

    <div>
      <label className="block text-gray-700 mb-2">Upload merch design</label>
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full border border-gray-300 rounded-lg p-2"
      />
    </div>

    <button
      type="submit"
      className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding Merchandise...
        </span>
      ) : 'Submit'}
    </button>
  </form>
</section>
      </main>
    </div>

  );
};

export default AdminAddMerch;
