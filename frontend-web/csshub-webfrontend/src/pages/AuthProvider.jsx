import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authSource, setAuthSource] = useState(null); // 'azure' or 'local'
  const [loading, setLoading] = useState(true);

  // Check if JWT token is valid by checking expiration time
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // Parse the JWT token (it has three parts separated by dots)
      const payload = token.split('.')[1];
      // The middle part is the payload, base64 encoded
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedPayload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };
  
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    // Only set authenticated if token exists and is valid
    const tokenValid = isTokenValid(token);
    setIsAuthenticated(tokenValid);
    
    if (userData && tokenValid) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setAuthSource('local');
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('user_data');
        setUser(null);
      }
    } else if (token && tokenValid) {
      // If we have a valid token but no user data, it's likely from Azure AD
      setAuthSource('azure');
    } else if (!tokenValid && token) {
      // If token is invalid, clear it
      console.log('Token expired or invalid, logging out');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setIsAuthenticated(false);
      setUser(null);
      setAuthSource(null);
    }
    
    setLoading(false);

    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem('access_token');
      const updatedUserData = localStorage.getItem('user_data');
      
      setIsAuthenticated(!!updatedToken);
      
      if (!updatedToken) {
        setUser(null);
        setAuthSource(null);
      } else if (updatedUserData) {
        try {
          setUser(JSON.parse(updatedUserData));
          setAuthSource('local');
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginWithToken = (token, userData) => {
    if (!token) return false;
    
    localStorage.setItem('access_token', token);
    
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    }
    
    setIsAuthenticated(true);
    setAuthSource('local');
    return true;
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    setIsAuthenticated(false);
    setUser(null);
    setAuthSource(null);
    
    // Only redirect to backend logout for Azure auth
    if (authSource === 'azure') {
      window.location.href = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/logout'
        : 'https://ccshub-systeminteg.azurewebsites.net/logout';
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      authSource,
      loading,
      logout,
      loginWithToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};