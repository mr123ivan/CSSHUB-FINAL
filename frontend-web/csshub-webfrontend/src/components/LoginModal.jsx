import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FaTimes } from 'react-icons/fa';
import { FaMicrosoft } from 'react-icons/fa';
import React, { useState } from 'react';
import SignupModal from './SignupModal';
import { useAuth } from '../pages/AuthProvider';
import logoBanner from '../assets/logoBanner.png';
import LocalLogin from './LocalLogin';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: '#facc15',
  boxShadow: 24,
  p: 0,
  borderRadius: 3,
  overflow: 'hidden',
  display: 'flex',
};

export default function LoginModal({ open, handleClose }) {
  const { isAuthenticated, logout, setUser } = useAuth();
  const [openSignup, setOpenSignup] = useState(false);
  const [loginMethod, setLoginMethod] = useState('local'); // 'local' or 'azure'

  const handleLoginRedirect = () => {
    window.location.href = process.env.NODE_ENV === 'development'
      ? 'https://ccshub-systeminteg.azurewebsites.net/login/oauth2/authorization/azure-dev'
      : 'https://ccshub-systeminteg.azurewebsites.net/login/oauth2/authorization/azure-dev';
  };
  
  const handleLoginSuccess = (user) => {
    setUser(user);
    handleClose();
    // Redirect to user page
    window.location.href = '/userpage';
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="login-modal"
      aria-describedby="login-modal-desc"
    >
      <Box sx={style}>
        <Box
          sx={{
            width: '40%',
            backgroundImage: `url(${logoBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box sx={{ width: '60%', p: 4, position: 'relative' }}>
          <Button
            sx={{ position: 'absolute', top: 8, right: 8, minWidth: 'auto', p: 1, color: 'black' }}
            onClick={handleClose}
          >
            <FaTimes />
          </Button>
          
          <Typography id="login-modal" variant="h5" fontWeight="bold" textAlign="center" mb={4}>
            Login to CSS Hub
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            {loginMethod === 'local' ? (
              <LocalLogin onClose={handleClose} onLoginSuccess={handleLoginSuccess} />
            ) : (
              <>
                <Typography variant="body1" textAlign="center" mb={2}>
                  Please login with your Microsoft account to access CSS Hub services.
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={handleLoginRedirect}
                  sx={{
                    backgroundColor: '#0078d4',
                    '&:hover': {
                      backgroundColor: '#106ebe',
                    },
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                  startIcon={<FaMicrosoft />}
                >
                  Sign in with Microsoft
                </Button>
                
                <Button 
                  onClick={() => setLoginMethod('local')}
                  variant="text"
                  sx={{ textTransform: 'none' }}
                >
                  Use email and password instead
                </Button>
              </>
            )}
            
            {loginMethod === 'azure' && (
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                Don't have an account?
                <Button
                  onClick={() => setOpenSignup(true)}
                  sx={{ textTransform: 'none', fontWeight: 'bold', ml: 1 }}
                >
                  Sign up
                </Button>
              </Typography>
            )}
            
            {loginMethod === 'local' && (
              <Button 
                onClick={() => setLoginMethod('azure')}
                variant="text"
                sx={{ textTransform: 'none', mt: 2 }}
              >
                Use Microsoft login instead
              </Button>
            )}
          </Box>
          <div className="text-center mt-6 text-black">
            <p>Don’t have an account yet?</p>
            <button
              onClick={() => setOpenSignup(true)}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Sign Up
            </button>
            <SignupModal open={openSignup} handleClose={() => setOpenSignup(false)} />
          </div>
        </Box>
      </Box>
    </Modal>
  );
}