import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './pages/ProtectedRoute';
import AdminProtectedRoute from './Admin/AdminProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import UserPage from './pages/UserPage';
import MerchPage from './pages/MerchPage';
import EventPage from './pages/EventPage';
import EventDetailPage from './pages/EventDetailPage';
import ProductPreview from './pages/ProductPreview';
import GcashPayment from './pages/GcashPayment';
import Invoice from './pages/Invoice';
import AdminLogin from './Admin/AdminLogin';
import AdminMain from './Admin/AdminMain';
import AdminMembers from './Admin/AdminMembers';
import AdminUpcomingEvents from './Admin/AdminUpcomingEvents';
import AdminMerch from './Admin/AdminMerch';
import AdminOrders from './Admin/AdminOrders';
import AdminAddEvent from './Admin/AdminAddEvent';
import AdminAddMerch from './Admin/AdminAddMerch';
import { AuthProvider } from './pages/AuthProvider';
import { useEffect } from 'react';

// LogoutButton Component (integrated here for simplicity)
const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token'); // Clear JWT
    navigate('/'); // Redirect to landing page after logout
    window.location.href = process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080/logout'
      : 'https://ccshub-systeminteg.azurewebsites.net/logout'; // Trigger server-side logout
  };

  return (
    <button onClick={handleLogout} className="btn btn-primary">
      Logout
    </button>
  );
};

// Main App Component
function App() {
  // Extract JWT from URL and store in localStorage
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      // Optionally redirect to remove token from URL
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/userpage" element={<UserPage />} />
          <Route path="/merchpage" element={<MerchPage />} />
          <Route path="/eventpage" element={<EventPage />} />
          <Route path="/eventdetailpage" element={<EventDetailPage />} />
          <Route path="/productpreview" element={<ProductPreview />} />
          <Route path="/gcashpayment" element={<GcashPayment />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/logout" element={<LogoutButton />} />

          {/* Admin routes */}
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/adminmain" element={<AdminProtectedRoute><AdminMain /></AdminProtectedRoute>} />
          <Route path="/adminmembers" element={<AdminProtectedRoute><AdminMembers /></AdminProtectedRoute>} />
          <Route path="/adminupcomingevents" element={<AdminProtectedRoute><AdminUpcomingEvents /></AdminProtectedRoute>} />
          <Route path="/adminmerch" element={<AdminProtectedRoute><AdminMerch /></AdminProtectedRoute>} />
          <Route path="/adminorders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
          <Route path="/adminaddevent" element={<AdminProtectedRoute><AdminAddEvent /></AdminProtectedRoute>} />
          <Route path="/adminaddmerch" element={<AdminProtectedRoute><AdminAddMerch /></AdminProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;