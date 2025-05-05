import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/css3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-90 z-10" />

      {/* Text Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Computer Student's Society Hub
        </h1>
        <p className="text-xl max-w-xl mb-6">A hub made for CSS Members.</p>

        {/* Get Started Button */}
        <a
        href="#about"
        className="bg-yellow-600 hover:bg-black text-white font-semibold py-3 px-6 rounded-full transition duration-300"
        >
        Get Started
        </a>
      </div>
    </div>
  );
};

export default HeroSection;

