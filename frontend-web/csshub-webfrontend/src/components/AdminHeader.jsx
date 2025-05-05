import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.setItem("isAdminAuthenticated", "false");
    navigate('/adminlogin');
  };

  return (
    <header className="bg-black text-yellow-500 text-center py-4 shadow-md flex justify-between items-center px-6">
      <div className="flex-1 text-center">
        <h1 className="text-2xl font-bold">Computer Students Society</h1>
      </div>
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
