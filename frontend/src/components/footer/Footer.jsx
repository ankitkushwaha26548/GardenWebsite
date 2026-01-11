import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#e6f0e9] text-[#37474f] py-6 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Site description */}
        <div className="text-sm opacity-80">
          Built for nature lovers. Simple, helpful gardening site.
        </div>
        {/* Navigation links */}
        <div className="flex gap-4 text-xs opacity-80">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
        {/* Copyright */}
        <div className="text-xs text-right opacity-80">
          &copy; {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  );
}
