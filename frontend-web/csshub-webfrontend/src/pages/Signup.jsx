import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const Signup = () => {
 

  return (
    <div className="flex w-full h-screen shadow-xl">
      {/* Left Section with Background Image */}
      <div
        className="relative w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/logoBanner.png')" }}
      >
      </div>

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
        <span className="text-black font-medium">Create account with Microsoft</span>
        <button
          className="flex items-center gap-2 bg-white border border-gray-300 px-5 py-2 rounded-lg shadow-md hover:shadow-lg mb-5 mt-2 cursor-pointer"
        >
          <img
            src="/src/assets/microsoft logo.png"
            alt="Microsoft"
            className="w-11 h-6"
          />
          Sign in with Microsoft
        </button>

        <p className="mb-2 mt-20">Already have an account?</p>

        {/* Sign Up Button */}
        <Link to="/login">
          <button className="bg-gray-800 text-white py-2 px-6 rounded-lg mb-3 text-lg hover:bg-gray-700">
            Log in
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Signup;


