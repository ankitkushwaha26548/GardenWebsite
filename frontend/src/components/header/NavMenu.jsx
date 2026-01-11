import React from "react";
import { Link } from "react-router-dom";

export default function NavMenu({ menuOpen }) {
  // Define your navigation links with route paths and icons
  const links = [
    { to: "/", label: "Home"},
    { to: "/guides", label: "Guides" },
    { to: "/calendar", label: "Calendar" },
    { to: "/blog", label: "Blog" },
    { to: "/gallery", label: "Gallery" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <ul
      className={`nav-menu fixed md:static top-20 left-0 md:flex md:gap-1 bg-white md:bg-transparent w-full md:w-auto
         h-[calc(100vh-80px)] md:h-auto flex-col md:flex-row items-start md:items-center p-6 md:p-0 shadow-lg md:shadow-none 
         transition-transform duration-300 ${
           menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
         }`}
    >
      {links.map(({ to, label, icon }) => (
        <li key={to}>
          <Link
            to={to}
            className="flex items-center gap-0.5 px-4 py-2 rounded-lg hover:text-pink-500 hover:underline hover:underline-offset-4 transition-all"
          >
            <i className={`fas ${icon}`}></i>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}