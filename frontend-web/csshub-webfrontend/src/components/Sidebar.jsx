import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTshirt, FaCalendarAlt, FaAngleRight, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../pages/AuthProvider';
import { useMsal } from '@azure/msal-react';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState('User');
  
  // Get user info from auth contexts
  const { isAuthenticated, user } = useAuth();
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  
  useEffect(() => {
    // Try to get the user's name from various sources
    if (user && user.username) {
      setDisplayName(user.username);
    } else if (activeAccount && activeAccount.name) {
      setDisplayName(activeAccount.name);
    } else {
      // Try to get from localStorage as last resort
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.username) {
            setDisplayName(parsedUser.username);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, [user, activeAccount]);
  
  // Define navigation items
  const navItems = [
    { name: 'Home', path: '/userpage', icon: <FaHome /> },
    { name: 'Merchandise', path: '/merchpage', icon: <FaTshirt /> },
    { name: 'Events', path: '/eventpage', icon: <FaCalendarAlt /> },
  ];
  
  // Check if current path matches a nav item
  const isActive = (path) => location.pathname === path;
  
  return (
    <aside 
      className={`${collapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-black to-gray-900 text-white transition-all duration-300 ease-in-out shadow-xl z-10 flex flex-col`}
    >
      {/* Collapse toggle button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-yellow-500 text-black p-1 rounded-full shadow-lg hover:bg-yellow-400 transition-colors z-20"
        aria-label="Toggle sidebar"
      >
        <FaAngleRight className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
      </button>
      
      {/* Logo and Welcome */}
      <div className={`${collapsed ? 'py-6 px-2' : 'p-6'} border-b border-gray-800`}>
        <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-4'} mb-4`}>
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg text-black font-bold">
              {displayName.charAt(0).toUpperCase() || 'U'}
            </div>
            {collapsed && (
              <div className="absolute left-full ml-4 top-0 bg-gray-800 text-white px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                {displayName}
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm text-gray-400">Welcome,</div>
              <div className="text-xl font-bold text-yellow-500 truncate">{displayName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <div 
                  className={`
                    ${isActive(item.path) 
                      ? 'bg-yellow-500 text-black font-bold shadow-md'
                      : 'text-gray-300 hover:bg-gray-800'} 
                    ${collapsed ? 'justify-center' : 'justify-start'}
                    flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                  {collapsed && !isActive(item.path) && (
                    <div className="absolute left-full ml-4 bg-gray-800 text-white px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className={`p-4 text-center border-t border-gray-800 ${collapsed ? 'text-[0.6rem]' : 'text-xs'} text-gray-500`}>
        © 2025 <span className="text-yellow-500">CSS</span>
      </div>
    </aside>
  );
};

export default Sidebar;