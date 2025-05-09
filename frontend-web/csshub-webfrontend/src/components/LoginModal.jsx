import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FaTimes } from 'react-icons/fa';
import React, { useState } from 'react';
import SignupModal from './SignupModal';
import { useAuth } from '../pages/AuthProvider';
import logoBanner from '../assets/logoBanner.png';

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
  const { isAuthenticated, logout } = useAuth();
  const [openSignup, setOpenSignup] = useState(false);

  const handleLoginRedirect = () => {
    window.location.href = process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080/login/oauth2/authorization/azure-dev'
      : 'https://ccshub-systeminteg.azurewebsites.net/login/oauth2/authorization/azure-dev';
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
          <FaTimes
            className="absolute top-4 right-4 text-xl cursor-pointer hover:text-yellow-500"
            onClick={handleClose}
          />
          <Typography variant="h5" className="text-center mb-4 font-bold text-black">
            Welcome to Computer Student Society Hub Log in
          </Typography>
          <Typography className="text-center text-sm mb-2 text-black">
            Continue with Microsoft
          </Typography>
          <div className="flex justify-center">
            {isAuthenticated ? (
              <Button onClick={logout} variant="contained" color="secondary">
                Logout
              </Button>
            ) : (
              <Button
                onClick={handleLoginRedirect}
                variant="contained"
                color="primary"
                sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                  alt="Microsoft Logo"
                  style={{ width: '20px', height: '20px' }}
                />
                Log in with Microsoft
              </Button>
            )}
          </div>
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