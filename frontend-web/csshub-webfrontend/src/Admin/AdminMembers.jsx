import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminActionButtons from '../components/AdminActionButtons';
import { FaUser, FaEnvelope, FaTrash, FaSearch } from 'react-icons/fa';

const AdminMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Try the Azure endpoint first
      const response = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/users');
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching users from Azure:", error);
      // Fall back to localhost if Azure fails
      try {
        const localResponse = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/users');
        setUsers(localResponse.data);
        setError(null);
      } catch (localError) {
        console.error("Error fetching users from localhost:", localError);
        setError('Failed to load users. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Try Azure endpoint first
        await axios.delete(`https://ccshub-systeminteg.azurewebsites.net/api/users/${userId}`);
        setUsers(users.filter(user => user.userId !== userId)); // Remove deleted user from state
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user from Azure:', error);
        // Fall back to localhost if Azure fails
        try {
          await axios.delete(`https://ccshub-systeminteg.azurewebsites.net/api/users/${userId}`);
          setUsers(users.filter(user => user.userId !== userId));
          alert('User deleted successfully');
        } catch (localError) {
          console.error('Error deleting user from localhost:', localError);
          alert('Failed to delete user. Please try again.');
        }
      }
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Members Management" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-yellow-500 mb-2">Members List</h1>
            <p className="text-gray-400">Manage CSS-HUB members and their accounts</p>
          </div>
          
          <AdminActionButtons />
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 text-red-100 p-4 mb-6 rounded">
              <p className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {/* Search and Controls */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchUsers}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
              >
                <FaUser className="mr-1" />
                Refresh List
              </button>
            </div>
          </div>
          
          {/* Members List */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-yellow-500 text-black font-bold">
              Members Directory ({filteredUsers.length})
            </div>
            
            {!loading && filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No members match your search' : 'No members found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredUsers.map((user) => (
                  <div key={user.userId} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500">
                          <FaUser className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{user.username || 'Anonymous User'}</h4>
                          <div className="flex items-center text-gray-400 text-sm mt-1">
                            <FaEnvelope className="mr-1" />
                            <span>{user.email || 'No email provided'}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <span>Member since: </span>
                            <span>{user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={() => handleDelete(user.userId)}
                              className="flex items-center px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                            >
                              <FaTrash className="mr-1" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMembers;
