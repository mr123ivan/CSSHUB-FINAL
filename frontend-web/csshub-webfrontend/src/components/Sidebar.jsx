import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ userName = 'User' }) => {
  return (
    <aside className="w-64 bg-black text-yellow-500 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-6">
          <img
            src="https://via.placeholder.com/50"
            alt="User Profile"
            className="w-12 h-12 rounded-full mr-4"
          />
          <div className="text-xl font-bold">Welcome, {userName}!</div>
        </div>

        <Link to="/userpage">
          <button className="w-full mb-4 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition">
            Home
          </button>
        </Link>
        <Link to="/merchpage">
          <button className="w-full mb-4 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition">
            Merchandise
          </button>
        </Link>
        <Link to="/eventpage">
          <button className="w-full px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition">
            Events
          </button>
        </Link>
      </div>
      <div className="text-xs text-gray-400 mt-10">© 2025 CSS</div>
    </aside>
  );
};

export default Sidebar;
