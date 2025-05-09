import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaCalendarAlt, FaTshirt, FaShoppingBag, FaChartLine } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Helper function to determine if a link is active
  const isActive = (path) => {
    return currentPath === path ? 'bg-yellow-400 text-gray-800 font-bold' : 'hover:bg-gray-700';
  };

  return (
    <aside className="w-64 bg-gray-800 text-yellow-400 h-screen flex flex-col">
      <div className="p-6 border-b border-yellow-400/20">
        <h1 className="text-xl font-bold flex items-center justify-center mb-2">CSS-HUB</h1>
        <p className="text-xs text-center text-yellow-400/80">Admin Dashboard</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          {/* Overview Section */}
          <div>
            <h2 className="text-xs uppercase tracking-wider mb-3 text-yellow-400/80 font-semibold">Dashboard</h2>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/adminmain" 
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/adminmain')}`}
                >
                  <FaChartLine className="mr-3" />
                  <span>Overview</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Members Section */}
          <div>
            <h2 className="text-xs uppercase tracking-wider mb-3 text-yellow-400/80 font-semibold">Members</h2>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/adminmembers" 
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/adminmembers')}`}
                >
                  <FaUsers className="mr-3" />
                  <span>Members List</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Events Section */}
          <div>
            <h2 className="text-xs uppercase tracking-wider mb-3 text-yellow-400/80 font-semibold">Events</h2>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/adminupcomingevents" 
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/adminupcomingevents')}`}
                >
                  <FaCalendarAlt className="mr-3" />
                  <span>Upcoming Events</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Merchandise Section */}
          <div>
            <h2 className="text-xs uppercase tracking-wider mb-3 text-yellow-400/80 font-semibold">Merchandise</h2>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/adminmerch" 
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/adminmerch')}`}
                >
                  <FaTshirt className="mr-3" />
                  <span>List of Merchandise</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Orders Section */}
          <div>
            <h2 className="text-xs uppercase tracking-wider mb-3 text-yellow-400/80 font-semibold">Orders</h2>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/adminorders" 
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${isActive('/adminorders')}`}
                >
                  <FaShoppingBag className="mr-3" />
                  <span>Manage Orders</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t border-yellow-400/20 text-xs text-center">
        © {new Date().getFullYear()} CSS-HUB
      </div>
    </aside>
  );
};

export default AdminSidebar;
