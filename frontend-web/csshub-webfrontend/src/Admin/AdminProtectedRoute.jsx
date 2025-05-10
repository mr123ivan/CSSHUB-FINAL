import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { isAdminAuthenticated } from '../utils/adminAuth';

/**
 * AdminProtectedRoute component
 * Protects admin routes by checking admin authentication status
 * Now simplified to just check admin credentials instead of role-based verification
 */
const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [adminAuth, setAdminAuth] = useState(false);

  useEffect(() => {
    // Simple check for admin authentication status using the utility function
    const checkAdminAuth = () => {
      setLoading(true);
      try {
        const isAdmin = isAdminAuthenticated();
        setAdminAuth(isAdmin);
      } catch (error) {
        console.error('Failed to check admin authentication:', error);
        setAdminAuth(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAuth();
  }, []);

  console.log("Admin authentication status:", adminAuth, "Loading:", loading);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!adminAuth) {
    return <Navigate to="/adminlogin" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;