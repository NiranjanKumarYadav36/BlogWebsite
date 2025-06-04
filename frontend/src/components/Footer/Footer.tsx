import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto flex flex-col items-center">
        {/* Social Media Icons */}
        <div className="flex space-x-6 mb-4">
          <a href="#" className="text-[#1E40AF] hover:text-[#FFD700] transition-all"><Facebook size={24} /></a>
          <a href="#" className="text-[#1E40AF] hover:text-[#FFD700] transition-all"><Twitter size={24} /></a>
          <a href="#" className="text-[#1E40AF] hover:text-[#FFD700] transition-all"><Instagram size={24} /></a>
        </div>

        {/* Copyright */}
        <p className="text-gray-600 text-sm text-center">
          © {new Date().getFullYear()} MyBlog. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;