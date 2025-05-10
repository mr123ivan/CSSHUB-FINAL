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
  const config = getAuthConfig();
  
  // Try multiple endpoint patterns to ensure deletion works
  // First attempt: Direct endpoint pattern (matches user deletion pattern)
  try {
    // Try Azure endpoint first with direct pattern
    return await axios.delete(`https://ccshub-systeminteg.azurewebsites.net/api/events/${eventId}`, config);
  } catch (azureDirectError) {
    console.log('Trying alternate Azure endpoint pattern...');
    
    // Second attempt: With /delete/ in the path
    try {
      return await axios.delete(`https://ccshub-systeminteg.azurewebsites.net/api/events/delete/${eventId}`, config);
    } catch (azureError) {
      console.error('All Azure endpoint attempts failed:', azureError);
      
      // Fall back to localhost patterns
      try {
        // Try direct pattern first (matches user deletion pattern)
        return await axios.delete(`http://localhost:8080/api/events/${eventId}`, config);
      } catch (localDirectError) {
        console.log('Trying alternate localhost endpoint pattern...');
        
        // Last attempt: With /delete/ in the path
        try {
          return await axios.delete(`http://localhost:8080/api/events/delete/${eventId}`, config);
        } catch (localError) {
          console.error('All deletion attempts failed:', localError);
          throw localError; // Re-throw the final error for the caller to handle
        }
      }
    }
  }
};

/**
 * Direct API call to delete merchandise
 * @param {number} itemId The ID of the merchandise to delete
 * @returns {Promise} Result of the API call
 */
export const deleteMerchandise = async (itemId) => {
  const config = getAuthConfig();
  
  // Try multiple endpoint patterns to ensure deletion works
  // First attempt: Direct endpoint pattern (matches user deletion pattern)
  try {
    // Try Azure endpoint first with direct pattern
    return await axios.delete(`https://ccshub-systeminteg.azurewebsites.net/api/merchandises/${itemId}`, config);
  } catch (azureDirectError) {
    console.log('Trying alternate Azure endpoint pattern...');
    
    // Second attempt: With /delete/ in the path
    try {
      return await axios.delete(`https://ccshub-systeminteg.azurewebsites.net/api/merchandises/delete/${itemId}`, config);
    } catch (azureError) {
      console.error('All Azure endpoint attempts failed:', azureError);
      
      // Fall back to localhost patterns
      try {
        // Try direct pattern first (matches user deletion pattern)
        return await axios.delete(`http://localhost:8080/api/merchandises/${itemId}`, config);
      } catch (localDirectError) {
        console.log('Trying alternate localhost endpoint pattern...');
        
        // Last attempt: With /delete/ in the path
        try {
          return await axios.delete(`http://localhost:8080/api/merchandises/delete/${itemId}`, config);
        } catch (localError) {
          console.error('All deletion attempts failed:', localError);
          throw localError; // Re-throw the final error for the caller to handle
        }
      }
    }
  }
};

/**
 * Direct API call to add merchandise
 * @param {FormData} merchandiseData The merchandise data as FormData
 * @returns {Promise} Result of the API call
 */
export const addMerchandise = async (merchandiseData) => {
  try {
    // No authentication check - directly call the endpoint with auth config
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        'Content-Type': 'multipart/form-data'
      }
    };
    
    return await axios.post('http://localhost:8080/api/merchandises/create', merchandiseData, config);
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
  // Include basic authentication if we have credentials
  const username = adminUsername || localStorage.getItem('adminUsername');
  const password = adminPassword || sessionStorage.getItem('adminPassword');
  
  // Create the config object with auth and headers
  return {
    headers: {
      'Content-Type': 'application/json',
      // This header helps identify admin requests in case we need to debug
      'X-Admin-Request': 'true'
    },
    // Include basic auth if we have credentials
    auth: username && password ? {
      username,
      password
    } : undefined,
    withCredentials: true
  };
};
