import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../pages/AuthProvider';

const UserNavbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="flex items-center px-6 py-4 shadow-md bg-black">
      <Link to="/userpage" className="flex-1 flex justify-center">
        <h1 className="text-2xl font-bold text-yellow-500">Computer Student's Society</h1>
      </Link>
      <div className="space-x-4">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition"
          >
            Log out
          </button>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default UserNavbar;