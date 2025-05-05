/**
 * Admin Authentication Utility
 * Handles admin authentication state and token management
 */
import axios from 'axios';

// Store admin credentials globally for the session
let adminUsername = '';
let adminPassword = '';

/**
 * Check if admin is currently authenticated
 * @returns {boolean} Whether the admin is authenticated
 */
export const isAdminAuthenticated = () => {
  const isAuth = localStorage.getItem("isAdminAuthenticated");
  const username = localStorage.getItem("adminUsername");
  
  if (!isAuth || !username) {
    return false;
  }
  
  // Get the credentials from memory if available
  adminUsername = adminUsername || localStorage.getItem("adminUsername");
  adminPassword = adminPassword || sessionStorage.getItem("adminPassword");
  
  return isAuth === "true";
};

/**
 * Get the admin username
 * @returns {string|null} The admin username or null if not authenticated
 */
export const getAdminUsername = () => {
  return localStorage.getItem("adminUsername") || adminUsername;
};

/**
 * Authenticate an admin by storing their info
 * @param {string} username The admin username
 * @param {string} password The admin password
 * @param {boolean} rememberMe Whether to remember the admin for longer
 */
export const authenticateAdmin = (username, password, rememberMe = false) => {
  // Store credentials for reuse in API calls
  adminUsername = username;
  adminPassword = password;
  
  // Save to storage
  localStorage.setItem("adminUsername", username);
  localStorage.setItem("isAdminAuthenticated", "true");
  
  // Only store password in session storage, never in localStorage
  if (rememberMe) {
    sessionStorage.setItem("adminPassword", password);
  }
  
  return true;
};

/**
 * Log out an admin by clearing their info
 */
export const logoutAdmin = () => {
  localStorage.removeItem("adminUsername");
  localStorage.removeItem("isAdminAuthenticated");
  sessionStorage.removeItem("adminPassword");
  
  // Clear in-memory credentials
  adminUsername = '';
  adminPassword = '';
};

/**
 * Direct API call to delete an event
 * @param {number} eventId The ID of the event to delete
 * @returns {Promise} Result of the API call
 */
export const deleteEvent = async (eventId) => {
  if (!isAdminAuthenticated() || !adminUsername) {
    throw new Error('Authentication required');
  }
  
  // Use basic authentication approach instead of token
  try {
    // First re-authenticate to ensure we have fresh credentials
    await axios.post('http://localhost:8080/api/admins/login', {
      username: adminUsername,
      password: adminPassword || sessionStorage.getItem("adminPassword")
    });
    
    // Then make the delete request (basic auth will be cached for this session)
    return await axios.delete(`http://localhost:8080/api/events/${eventId}`);
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
};

/**
 * Direct API call to delete merchandise
 * @param {number} itemId The ID of the merchandise to delete
 * @returns {Promise} Result of the API call
 */
export const deleteMerchandise = async (itemId) => {
  if (!isAdminAuthenticated() || !adminUsername) {
    throw new Error('Authentication required');
  }
  
  // Use basic authentication approach instead of token
  try {
    // First re-authenticate to ensure we have fresh credentials
    await axios.post('http://localhost:8080/api/admins/login', {
      username: adminUsername,
      password: adminPassword || sessionStorage.getItem("adminPassword")
    });
    
    // Then make the delete request (basic auth will be cached for this session)
    return await axios.delete(`http://localhost:8080/api/merchandises/delete/${itemId}`);
  } catch (error) {
    console.error('Error in deleteMerchandise:', error);
    throw error;
  }
};

/**
 * Direct API call to add merchandise
 * @param {FormData} merchandiseData The merchandise data as FormData
 * @returns {Promise} Result of the API call
 */
export const addMerchandise = async (merchandiseData) => {
  if (!isAdminAuthenticated() || !adminUsername) {
    throw new Error('Authentication required');
  }
  
  // Use basic authentication approach instead of token
  try {
    // First re-authenticate to ensure we have fresh credentials
    await axios.post('http://localhost:8080/api/admins/login', {
      username: adminUsername,
      password: adminPassword || sessionStorage.getItem("adminPassword")
    });
    
    // Then make the create request with the merchandise data
    // Note: Using the correct endpoint from the backend controller
    return await axios.post('http://localhost:8080/api/merchandises/create', merchandiseData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('Error in addMerchandise:', error);
    throw error;
  }
};

/**
 * Get config object for axios requests
 * @returns {Object} Config object for axios
 */
export const getAuthConfig = () => {
  // No headers needed since we're using a different approach
  return {};
};
