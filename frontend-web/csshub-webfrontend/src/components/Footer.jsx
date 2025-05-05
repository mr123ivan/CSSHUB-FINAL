import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 mt-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand Section */}
        <div>
          <h1 className="text-2xl font-bold mb-2">CSS HUB</h1>
          <p className="text-sm text-gray-400">
            Geeks one stop hub.
          </p>
        </div>

        {/* Links Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-blue-400">Home</a></li>
            <li><a href="#" className="hover:text-blue-400">About</a></li>
            <li><a href="#" className="hover:text-blue-400">Products</a></li>
            <li><a href="#" className="hover:text-blue-400">Contact</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
          <p className="text-sm ">Email: support@yourapp.com</p>
          <p className="text-sm ">Phone: +63 912 345 6789</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white mt-8 pt-4 text-center text-sm ">
        © {new Date().getFullYear()} Computer Students Society Hub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
