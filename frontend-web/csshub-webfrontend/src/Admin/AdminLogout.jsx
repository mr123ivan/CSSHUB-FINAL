// AdminHeader.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.setItem("isAdminAuthenticated", "false");
    navigate('/adminlogin');
  };

  return (
    <header className="bg-black text-yellow-500 text-center py-4 shadow-md flex justify-between items-center px-6">
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminLogout;
