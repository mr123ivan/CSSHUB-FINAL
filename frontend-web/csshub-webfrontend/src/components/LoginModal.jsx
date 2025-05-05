import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { FaTimes } from "react-icons/fa";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from '../pages/AuthConfig'; 
import React, { useState } from 'react';


import logoBanner from '../assets/logoBanner.png'; // adjust the path if needed
import SignupModal from './SignupModal'


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700, // Increased width
  bgcolor: '#facc15',
  boxShadow: 24,
  p: 0, // No padding here; we’ll add it inside
  borderRadius: 3,
  overflow: 'hidden',
  display: 'flex', // Enables side-by-side layout
};

export default function LoginModal({ open, handleClose }) {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const [openSignup, setOpenSignup] = useState(false);

  const handleLoginRedirect = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        prompt: 'create',
      })
      .catch((error) => console.log(error));
  };

  const handleLogoutRedirect = () => {
    instance.logoutPopup({ postLogoutRedirectUri: '/' });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="login-modal"
      aria-describedby="login-modal-desc"
    >
      <Box sx={style}>
        {/* Left Image Section */}
        <Box
          sx={{
            width: '40%',
            backgroundImage: `url(${logoBanner})`, // Replace with your image URL
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Right Login Section */}
        <Box sx={{ width: '60%', p: 4, position: 'relative' }}>
          {/* Close Button */}
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
            <AuthenticatedTemplate>
              {activeAccount && (
                <Button onClick={handleLogoutRedirect} variant="contained" color="secondary">
                  Logout
                </Button>
              )}
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
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
            </UnauthenticatedTemplate>
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
