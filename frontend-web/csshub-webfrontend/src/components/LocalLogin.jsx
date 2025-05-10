import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaUser, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const LocalLogin = ({ onClose, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store the token
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      console.log('Login successful');
      
      // Close modal if applicable
      if (onClose) {
        onClose();
      }
      
      try {
        // Notify parent component
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      } catch (error) {
        console.error('Error in onLoginSuccess callback:', error);
      }
      
      // Use direct page redirect instead of React Router navigation
      // This ensures a complete page refresh with the new authentication state
      window.location.href = '/userpage';
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/register', { 
        email, 
        password,
        username: username.trim() 
      });
      
      const { token, user } = response.data;
      
      // Store the token
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      console.log('Registration successful');
      
      // Close modal if applicable
      if (onClose) {
        onClose();
      }
      
      // Notify parent component
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      
      // Redirect to user page - using window.location for full page refresh with new auth state
      window.location.href = '/userpage';
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.error || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and register forms
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
        {isLoginMode ? <><FaSignInAlt className="mr-2" /> Login</> : <><FaUserPlus className="mr-2" /> Register</>}
      </h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
            <FaEnvelope className="mr-2" /> Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>
        
        {!isLoginMode && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 flex items-center">
              <FaUser className="mr-2" /> Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
            <FaLock className="mr-2" /> Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            minLength="6"
          />
        </div>
        
        <div className="pt-1 flex justify-between">
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-md transition-colors disabled:opacity-70 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              isLoginMode ? 
                <><FaSignInAlt className="mr-2" /> Login</> : 
                <><FaUserPlus className="mr-2" /> Register</>
            )}
          </button>
        </div>
        
        <div className="text-center pt-2">
          <button 
            type="button" 
            onClick={toggleMode} 
            className="text-yellow-700 hover:text-yellow-900 underline text-sm"
          >
            {isLoginMode ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Or continue with Microsoft login
        </p>
      </div>
    </div>
  );
};

export default LocalLogin;
