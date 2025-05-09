import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function TokenExtractor() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      console.log('Token from URL:', token);
      
      // Store the token in localStorage
      localStorage.setItem('access_token', token);
      
      // For debugging - parse and log the token payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Roles claim:', payload.roles);
        console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
      } catch (error) {
        console.error('Error parsing token:', error);
      }
      
      // Remove token from URL to prevent exposure in browser history
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default TokenExtractor;