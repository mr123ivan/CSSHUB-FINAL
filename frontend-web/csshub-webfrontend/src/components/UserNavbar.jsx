import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthProvider';
import { FaUser, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import LoginModal from './LoginModal';

const UserNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center px-6 py-4 shadow-md bg-black">
      <Link to="/userpage" className="flex-1 flex justify-center">
        <h1 className="text-2xl font-bold text-yellow-500">Computer Student's Society</h1>
      </Link>
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <div className="text-yellow-500 flex items-center">
              <FaUser className="mr-2" />
              <span>{user ? user.username : 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition flex items-center"
            >
              <FaSignOutAlt className="mr-2" /> Log out
            </button>
          </>
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition flex items-center"
          >
            <FaSignInAlt className="mr-2" /> Log in
          </button>
        )}
      </div>
      
      <LoginModal open={loginModalOpen} handleClose={() => setLoginModalOpen(false)} />
    </nav>
  );
};

export default UserNavbar;