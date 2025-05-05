import React, { useState } from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const Navbar = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-black text-white">
        {/* Left: Logo */}
        <h1 className="text-2xl font-bold text-yellow-500 whitespace-nowrap">
          Computer Student's Society
        </h1>

        {/* Center: Navigation Links */}
        <ul className="hidden md:flex space-x-8 text-white font-medium">
          <li>
            <a href="#about" className="hover:text-yellow-400 transition">About</a>
          </li>
          <li>
            <a href="#products" className="hover:text-yellow-400 transition">Products</a>
          </li>
          <li>
            <a href="#executives" className="hover:text-yellow-400 transition">Executives</a>
          </li>
          <li>
            <a href="#contact" className="hover:text-yellow-400 transition">Contact</a>
          </li>
        </ul>

        {/* Right: Auth Buttons */}
        <div className="space-x-4">
          <button
            onClick={() => setOpenLogin(true)}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition"
          >
            Log in
          </button>

          <button
            onClick={() => setOpenSignup(true)}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Modals */}
      <LoginModal open={openLogin} handleClose={() => setOpenLogin(false)} />
      <SignupModal open={openSignup} handleClose={() => setOpenSignup(false)} />
    </div>
  );
};

export default Navbar;
