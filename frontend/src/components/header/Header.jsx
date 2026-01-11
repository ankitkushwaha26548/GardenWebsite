import { useState, useEffect, useContext } from "react";
import logo from "../../assets/logo.jpg";
import NavMenu from "./NavMenu";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import { AuthContext } from "../../auth/AuthProvider";


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, userName } = useContext(AuthContext);

  const handleSearch = (query) => {
    console.log("Searching for:", query);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".nav-menu") && !e.target.closest(".mobile-menu-btn")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="LeafLine Logo" className="h-9 w-9 object-cover" />
          <span className="font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-[#30c96b] via-[#1fc56a] to-[#139e43] bg-clip-text text-transparent">
            LeafLine
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-1 lg:flex-none">
          <NavMenu menuOpen={true} />
          <div className="flex-1 lg:flex-none">
            <SearchBar onSearch={handleSearch} />
          </div>

          {token ? (
            <span className="font-semibold text-slate-600 text-base">Hi, <span className="font-bold text-emerald-600">{userName}</span></span>
          ) : (
            <Link
              to="/login"
              className="bg-[#F9F9F9] rounded-xl w-[100px] h-[35px] flex items-center justify-center text-[#3f3f45] border border-[#717196] hover:bg-[#EEF4FF] hover:shadow-md transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn md:hidden text-green-600 text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-md p-4 animate-slideDown space-y-4">
          <SearchBar onSearch={handleSearch} />
          <NavMenu menuOpen={true} />

          {token ? (
            <p className="font-semibold text-slate-600 text-base">Hi, <span className="font-bold text-emerald-600">{userName}</span></p>
          ) : (
            <Link
              to="/login"
              className="mt-4 w-full bg-[#F9F9F9] rounded-xl h-[50px] flex items-center justify-center text-[#3E3FD8] border border-[#3E3FD8] hover:bg-[#EEF4FF] hover:shadow-md transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
