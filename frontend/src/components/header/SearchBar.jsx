import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      navigate(`/plantdatabase?search=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full sm:w-auto max-w-sm">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center border-2 rounded-full px-3 py-1.5 bg-white shadow-sm transition-all ${
          isFocused ? "border-gray-500 shadow-md" : "border-gray-300"
        }`}
      >
        <i className="fas fa-search text-gray-400 mr-2 text-sm"></i>
        <input
          type="text"
          placeholder="Search..."
          className="outline-none flex-1 text-gray-700 text-sm placeholder-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 ml-2 focus:outline-none transition-colors"
            aria-label="Clear search"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        )}
        <button
          type="submit"
          className="ml-2 text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none"
          aria-label="Search"
        >
          <i className="fas fa-arrow-right text-sm"></i>
        </button>
      </form>
    </div>
  );
}
