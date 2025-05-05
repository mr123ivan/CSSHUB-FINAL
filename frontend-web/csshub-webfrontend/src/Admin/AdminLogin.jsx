import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaLock, FaUser, FaExclamationTriangle } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { authenticateAdmin, isAdminAuthenticated } from "../utils/adminAuth";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate(location.state?.from || "/adminmain");
    }
  }, [navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call backend to validate credentials
      const response = await axios.post("http://localhost:8080/api/admins/login", {
        username: username,
        password: password,
      });

      console.log("Login response:", response);

      if (response.status === 200) {
        // Successful login - IMPORTANT: pass the password to the auth utility
        // This enables direct API calls for delete operations
        authenticateAdmin(username, password, rememberMe);

        // Redirect to dashboard or previous page
        navigate(location.state?.from || "/adminmain");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setError("Invalid username or password. Please try again.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection to the server.");
      } else {
        setError(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen shadow-xl bg-gray-100">
      {/* Left Section with Background Image */}
      <div
        className="relative hidden md:block w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/logoBanner.png')" }}
      >
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-white text-center p-8 max-w-lg">
            <h2 className="text-4xl font-bold mb-4">CSS Hub Administration</h2>
            <p className="text-xl">Manage events, merchandise, orders, and more from your admin dashboard.</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative bg-white md:w-1/2 w-full flex flex-col justify-center items-center text-black p-8 md:p-10">
        {/* Back Button */}
        <Link to="/">
          <FaArrowLeft className="absolute top-5 left-5 text-2xl cursor-pointer hover:text-yellow-500 transition-colors" />
        </Link>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-yellow-500 text-white mb-4">
              <FaLock className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Login
            </h1>
            <p className="text-gray-600 mt-2">Enter your credentials to access the admin panel</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-10 w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                Remember me for 7 days
              </label>
            </div>
            
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in to Admin Panel'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              This area is restricted to authorized administrators only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
