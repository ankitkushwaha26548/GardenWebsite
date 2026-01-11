import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { searchPlants } from "../api/api";

export default function PlantSearchBar({
  onRequestSearch,
  onSelectPlant,
  recentSearches = [],
  popularPlants = []
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSuggestions = async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await searchPlants({ q: value, limit: 6 });
      setSuggestions(response.results || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to search right now.");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(
    () => debounce((value) => fetchSuggestions(value), 300),
    []
  );

  useEffect(
    () => () => {
      debouncedFetch.cancel();
    },
    [debouncedFetch]
  );

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setPanelOpen(true);
    debouncedFetch(value);
  };

  const handleSubmit = async (event, forcedQuery) => {
    event?.preventDefault();
    const value = (forcedQuery ?? query).trim();
    if (!value) return;

    try {
      await onRequestSearch?.(value);
      setPanelOpen(false);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to search right now.");
    }
  };

  const handleSuggestionSelect = (plant) => {
    setQuery(plant.name);
    setPanelOpen(false);
    setSuggestions([]);
    onSelectPlant?.(plant);
    handleSubmit(null, plant.name);
  };

  const handleRecentClick = (value) => {
    setQuery(value);
    handleSubmit(null, value);
  };

  const showRecentAndPopular = !query && panelOpen;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <form
        className="flex gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-green-200
                   transition-all duration-300 focus-within:shadow-xl"
        onSubmit={handleSubmit}
      >
        <input
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-green-400
                     transition-all duration-200"
          value={query}
          onChange={handleInputChange}
          placeholder="Search plants, care needs, or tags 🌱"
          onFocus={() => setPanelOpen(true)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl
                     transition-all duration-200 hover:scale-[1.05] shadow-md"
          type="submit"
        >
          Search
        </button>
      </form>

      {/* Suggestions Panel */}
      {panelOpen && (
        <div
          className="absolute z-50 w-full bg-white rounded-2xl shadow-2xl mt-3 
                     border border-gray-100 overflow-hidden
                     animate-scaleIn"
        >
          {loading && (
            <div className="p-4 text-center text-sm text-gray-500 animate-pulse">
              🌿 Looking for plants…
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && query && (
            <ul>
              {suggestions.map((plant) => (
                <li
                  key={plant._id}
                  onMouseDown={() => handleSuggestionSelect(plant)}
                  className="flex gap-3 p-4 cursor-pointer
                             transition-all duration-200
                             hover:bg-green-50 hover:translate-x-1"
                >
                  {plant.imageUrl ? (
                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      🌱
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {plant.name}
                    </p>
                    <p className="text-xs text-gray-500 italic">
                      {plant.botanicalName}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Recent & Popular */}
          {showRecentAndPopular && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Recent Searches
                </p>
                {recentSearches.length ? (
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        onMouseDown={() => handleRecentClick(item)}
                        className="px-3 py-1.5 rounded-full bg-green-50 text-green-700
                                   text-sm hover:bg-green-100 transition"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Start typing to discover plants 🌿
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Popular Picks
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularPlants?.slice(0, 4).map((plant) => (
                    <button
                      key={plant._id}
                      onMouseDown={() => handleSuggestionSelect(plant)}
                      className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700
                                 text-sm hover:bg-emerald-100 transition"
                    >
                      {plant.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}