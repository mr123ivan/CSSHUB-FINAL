import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import UserNavbar from '../components/UserNavbar';
import { useAuth } from './AuthProvider';
import { useMsal } from '@azure/msal-react';
import { FaUser, FaEnvelope, FaIdBadge, FaCalendarAlt, FaPen, FaCheck, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

const UserProfile = () => {
  const { isAuthenticated, user, authSource } = useAuth();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const userName = activeAccount?.name || (user ? user.username : 'User');
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated]);
  
  const fetchUserProfile = async () => {
    setLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // First try Azure endpoint
      try {
        const response = await axios.get('https://ccshub-systeminteg.azurewebsites.net/api/users/current', config);
        
        if (response.data) {
          setUserProfile(response.data);
          setEditedProfile(response.data);
        } else {
          setError('No profile data found');
        }
      } catch (azureError) {
        console.error('Error fetching profile from Azure:', azureError);
        
        // Fall back to localhost if Azure fails
        try {
          const localResponse = await axios.get('http://localhost:8080/api/users/current', config);
          
          if (localResponse.data) {
            setUserProfile(localResponse.data);
            setEditedProfile(localResponse.data);
          } else {
            setError('No profile data found');
          }
        } catch (localError) {
          console.error('Error fetching profile from localhost:', localError);
          
          // If both fail, fall back to user data from auth context or local storage
          const userData = localStorage.getItem('user_data');
          
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              setUserProfile(parsedUser);
              setEditedProfile(parsedUser);
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              setError('Could not retrieve user profile');
            }
          } else if (user) {
            setUserProfile(user);
            setEditedProfile(user);
          } else if (activeAccount) {
            const msalProfile = {
              id: activeAccount.localAccountId,
              username: activeAccount.name,
              email: activeAccount.username,
              role: 'USER'
            };
            setUserProfile(msalProfile);
            setEditedProfile(msalProfile);
          } else {
            setError('Could not retrieve user profile');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };
  
  const saveProfile = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Authentication token not found');
        setSaving(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Azure AD users can't update their profile directly
      if (authSource === 'azure') {
        setSaving(false);
        setIsEditing(false);
        setError('Azure AD users cannot update their profile through this interface');
        return;
      }
      
      // Only try to update if we have a userId
      if (userProfile && userProfile.id) {
        try {
          const response = await axios.put(`https://ccshub-systeminteg.azurewebsites.net/api/users/${userProfile.id}`, editedProfile, config);
          
          if (response.data) {
            setUserProfile(response.data);
            
            // Also update local storage user data if it exists
            const userData = localStorage.getItem('user_data');
            if (userData) {
              try {
                const parsedUser = JSON.parse(userData);
                const updatedUser = { ...parsedUser, ...response.data };
                localStorage.setItem('user_data', JSON.stringify(updatedUser));
              } catch (error) {
                console.error('Error updating local storage user data:', error);
              }
            }
          }
        } catch (azureError) {
          console.error('Error updating profile on Azure:', azureError);
          
          // Fall back to localhost
          try {
            const localResponse = await axios.put(`http://localhost:8080/api/users/${userProfile.id}`, editedProfile, config);
            
            if (localResponse.data) {
              setUserProfile(localResponse.data);
              
              // Also update local storage user data if it exists
              const userData = localStorage.getItem('user_data');
              if (userData) {
                try {
                  const parsedUser = JSON.parse(userData);
                  const updatedUser = { ...parsedUser, ...localResponse.data };
                  localStorage.setItem('user_data', JSON.stringify(updatedUser));
                } catch (error) {
                  console.error('Error updating local storage user data:', error);
                }
              }
            }
          } catch (localError) {
            console.error('Error updating profile on localhost:', localError);
            setError('Error updating profile');
          }
        }
      } else {
        setError('Cannot update profile: Missing user ID');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Error saving profile data');
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };
  
  const cancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };
  
  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-black">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <UserNavbar />
        
        {/* Hero Banner */}
        <div className="bg-yellow-500 text-black py-8 px-8 md:px-12 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Profile</h1>
            <p className="text-gray-800 text-lg">View and manage your CSS-HUB account information</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FaSpinner className="text-4xl animate-spin mb-4 text-yellow-500" />
              <p>Loading your profile...</p>
            </div>
          ) : error ? (
            <div className="bg-red-800 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p>{error}</p>
              <button 
                onClick={fetchUserProfile}
                className="mt-4 px-4 py-2 bg-white text-red-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : userProfile ? (
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-yellow-500 text-black px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">PROFILE INFORMATION</h2>
                  <p className="text-sm text-gray-800">Joined: {formatJoinDate(userProfile.joinDate || userProfile.createdAt)}</p>
                </div>
                {!isEditing && authSource !== 'azure' && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-black text-yellow-500 rounded-lg hover:bg-gray-900 transition-colors flex items-center"
                  >
                    <FaPen className="mr-2" /> Edit Profile
                  </button>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Profile Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg text-black text-5xl font-bold">
                      {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-white text-lg font-bold">{userProfile.username || 'User'}</div>
                      <div className="text-yellow-500 text-sm">{userProfile.role || 'Member'}</div>
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-gray-400 text-sm font-medium mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={editedProfile.username || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-sm font-medium mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={editedProfile.email || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                          <button
                            onClick={saveProfile}
                            disabled={saving}
                            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors flex items-center"
                          >
                            {saving ? (
                              <>
                                <FaSpinner className="animate-spin mr-2" /> Saving...
                              </>
                            ) : (
                              <>
                                <FaSave className="mr-2" /> Save Changes
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={cancelEdit}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center"
                          >
                            <FaTimes className="mr-2" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-start border-b border-gray-700 pb-4">
                          <div className="text-yellow-500 text-xl mr-4 pt-1">
                            <FaUser />
                          </div>
                          <div>
                            <h3 className="text-gray-400 text-sm">Username</h3>
                            <p className="text-white text-lg">{userProfile.username || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start border-b border-gray-700 pb-4">
                          <div className="text-yellow-500 text-xl mr-4 pt-1">
                            <FaEnvelope />
                          </div>
                          <div>
                            <h3 className="text-gray-400 text-sm">Email</h3>
                            <p className="text-white text-lg">{userProfile.email || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start border-b border-gray-700 pb-4">
                          <div className="text-yellow-500 text-xl mr-4 pt-1">
                            <FaIdBadge />
                          </div>
                          <div>
                            <h3 className="text-gray-400 text-sm">Member ID</h3>
                            <p className="text-white text-lg">{userProfile.id || userProfile.localAccountId || 'Not available'}</p>
                          </div>
                        </div>
                        
                        {(userProfile.joinDate || userProfile.createdAt) && (
                          <div className="flex items-start">
                            <div className="text-yellow-500 text-xl mr-4 pt-1">
                              <FaCalendarAlt />
                            </div>
                            <div>
                              <h3 className="text-gray-400 text-sm">Joined</h3>
                              <p className="text-white text-lg">{formatJoinDate(userProfile.joinDate || userProfile.createdAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {authSource === 'azure' && (
                <div className="bg-gray-700 px-6 py-4 text-sm">
                  <div className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span className="text-gray-300">Your profile is managed by Azure Active Directory</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-300 mb-4">No profile information available</p>
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
