import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#e6f0e9] text-[#37474f] py-4 sm:py-6 px-4 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Site description */}
        <div className="text-xs sm:text-sm opacity-80 text-center sm:text-left">
          Built for nature lovers. Simple, helpful gardening site.
        </div>
        {/* Navigation links */}
        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm opacity-80">
          <a href="#" className="hover:underline transition-all">Home</a>
          <a href="#" className="hover:underline transition-all">About</a>
          <a href="#" className="hover:underline transition-all">Contact</a>
        </div>
        {/* Copyright */}
        <div className="text-xs opacity-80 text-center sm:text-right w-full sm:w-auto">
          &copy; {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  );
}
