import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
    window.location.href = process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080/logout'
      : 'https://ccshub-systeminteg.azurewebsites.net/logout';
  };

  return (
    <button onClick={handleLogout} className="btn btn-primary">
      Logout
    </button>
  );
}

export default LogoutButton;