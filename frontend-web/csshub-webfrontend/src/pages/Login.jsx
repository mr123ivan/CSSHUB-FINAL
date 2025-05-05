import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from './AuthConfig';  // Adjust the path based on your file structure

const Login = () => {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const handleLoginRedirect = () => {
    instance
        .loginRedirect({
            ...loginRequest,
            prompt: 'create',
        })
        .catch((error) => console.log(error));
}; 
  
  const handleLogoutRedirect = () => {
    instance.logoutPopup({postLogoutRedirectUri: '/',});
  };

  return (
    <div className="flex w-full h-screen shadow-xl">
      {/* Left Section with Background Image */}
      <div
        className="relative w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/logoBanner.png')" }}
      ></div>

      {/* Right Section */}
      <div className="relative bg-[#DEA811] w-1/2 flex flex-col justify-center items-center text-black p-10">
        {/* Back Button */}
        <Link to="/">
          <FaArrowLeft className="absolute top-5 left-5 text-2xl cursor-pointer hover:text-yellow-400" />
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-semibold mb-5 font-serif text-center">
          Welcome to Computer Student Society Hub
        </h1>

        {/* Microsoft Sign-in */}
        <span className="text-black font-medium">Continue with Microsoft</span>

        <div className="App mt-5">
          <AuthenticatedTemplate>
            {activeAccount ? (
              <button onClick={handleLogoutRedirect}>
                Logout
              </button>
            ) : null}
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <button 
              onClick={handleLoginRedirect} 
              className="bg-blue-600 text-white py-3 px-8 rounded-full text-lg flex items-center justify-center space-x-3 hover:bg-blue-700 transition-all ease-in-out duration-200"
            >
              {/* Microsoft Logo (You can use an icon here or custom one) */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
                alt="Microsoft Logo"
                className="w-6 h-6 mr-2" 
              />
              <span>Log in with Microsoft</span>
            </button>
          </UnauthenticatedTemplate>
        </div>

        <p className="mb-2 mt-20">Don’t have an account yet?</p>

        {/* Sign Up Button */}
        <Link to="/signup">
          <button className="bg-gray-800 text-white py-2 px-6 rounded-lg mb-3 text-lg hover:bg-gray-700">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
