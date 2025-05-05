import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/adminAuth';

/**
 * AdminProtectedRoute component
 * Protects admin routes by checking authentication status
 */
const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = isAdminAuthenticated();
  
  console.log("Admin authentication status:", isAuthenticated);
  
  if (!isAuthenticated) {
    // Redirect to login page and remember the attempted URL for after login
    return <Navigate to="/adminlogin" state={{ from: location.pathname }} replace />;
  }
  
  // User is authenticated, render the protected content
  return children;
};
  
export default AdminProtectedRoute;
