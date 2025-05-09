import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../pages/AuthProvider';
import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * AdminProtectedRoute component
 * Protects admin routes by checking authentication status and admin role
 */
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const response = await api.get('/users/sync');
        const user = response.data;
        const adminResponse = await api.get(`/users/${user.userId}`);
        const admin = adminResponse.data.admin;
        setIsAdmin(admin && admin.role === 'ADMIN');
      } catch (error) {
        console.error('Failed to check admin role:', error);
        setIsAdmin(false);
      }
    };

    if (isAuthenticated) {
      checkAdminRole();
    }
  }, [isAuthenticated]);

  console.log("Admin authentication status:", isAuthenticated, "Admin role:", isAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/adminlogin" state={{ from: location.pathname }} replace />;
  }

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/userpage" replace />;
  }

  return children;
};

export default AdminProtectedRoute;