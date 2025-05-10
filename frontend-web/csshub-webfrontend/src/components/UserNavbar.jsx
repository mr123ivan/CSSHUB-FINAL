import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../pages/AuthProvider';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaCog, FaShoppingCart } from 'react-icons/fa';
import LoginModal from './LoginModal';

const UserNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('userpage')) return 'Dashboard';
    if (path.includes('merchpage')) return 'Merchandise';
    if (path.includes('eventpage')) return 'Events';
    if (path.includes('productpreview')) return 'Product Details';
    return 'CSS-HUB';
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`
        sticky top-0 z-20 px-4 md:px-6 py-3
        bg-gradient-to-r from-black to-gray-900
        transition-all duration-300 ease-in-out
        ${scrolled ? 'shadow-xl' : ''}
      `}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/userpage" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-black text-xl font-bold">CS</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold hidden md:block">
              <span className="text-yellow-500">CS</span>
              <span className="text-white">S-HUB</span>
            </h1>
          </Link>

          {/* Page Title - Center (mobile hidden) */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-lg font-semibold text-white">{getPageTitle()}</h2>
          </div>
          
          {/* Buttons */}
          <div className="flex items-center space-x-2 md:space-x-4 relative">
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full pl-2 pr-3 py-1.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold">
                      {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:inline">{user ? user.username : 'User'}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-1 z-50 border border-gray-700">
                      <div className="border-b border-gray-700 pb-2 pt-1 px-4">
                        <p className="text-yellow-500 font-semibold">{user ? user.username : 'User'}</p>
                        <p className="text-gray-400 text-xs truncate">{user ? user.email : ''}</p>
                      </div>
                     
                      <Link to="/orders">
                        <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                          <FaShoppingCart className="inline mr-2" /> My Orders
                        </div>
                      </Link>
               
                      <div className="border-t border-gray-700 mt-1 pt-1">
                        <button 
                          onClick={() => {
                            handleLogout();
                            setMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <FaSignOutAlt className="inline mr-2" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors flex items-center shadow-md"
              >
                <FaSignInAlt className="mr-2" /> Log in
              </button>
            )}
          </div>
        </div>
      </nav>
      
      <LoginModal open={loginModalOpen} handleClose={() => setLoginModalOpen(false)} />
    </>
  );
};

export default UserNavbar;