import React from "react";
import executives from "../assets/executives.jpg"

const Executives = () => {
  return (
    <section style={{ backgroundColor: "#141213" }} className="py-12 px-4">

      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-white">Meet Our Executive Officers</h2>
        <p className="text-white mb-8">
          Dedicated leaders driving our organization forward. Get to know the people behind our vision and impact.
        </p>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src={executives}
            alt="Executive Officers Group Photo"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Executives;
