import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { universalSearch } from "../api/api";
import PlantCard from "../components/PlantCard";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ plants: [], pages: [], guides: [] });
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await universalSearch({ q: query, limit: 20 });
        setResults(data);
      } catch (err) {
        setError(err.message || "Search failed. Please try again.");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handlePlantClick = (plantId) => {
    navigate(`/plantdatabase?plantId=${plantId}`);
  };

  const handlePageClick = (path) => {
    navigate(path);
  };

  const handleGuideClick = (path) => {
    navigate(path);
  };

  const totalResults =
    (results?.plants?.length || 0) +
    (results?.pages?.length || 0) +
    (results?.guides?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-lg text-gray-600">
              Found {totalResults} result{totalResults !== 1 ? "s" : ""} for{" "}
              <span className="font-semibold text-emerald-600">"{query}"</span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* No Results State */}
        {!loading && results && totalResults === 0 && query && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-lg text-gray-600">
              No results found for "{query}"
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search terms
            </p>
          </div>
        )}

        {/* Results Sections */}
        {!loading && results && (
          <>
            {/* Plants Section */}
            {results.plants && results.plants.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌿</span> Plants ({results.plants.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.plants.map((plant) => (
                    <div
                      key={plant._id}
                      onClick={() => handlePlantClick(plant._id)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <PlantCard plant={plant} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pages Section */}
            {results.pages && results.pages.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📄</span> Pages ({results.pages.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.pages.map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageClick(page.path)}
                      className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-400 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-emerald-600 mb-1">
                        {page.title}
                      </div>
                      <div className="text-sm text-gray-500">{page.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Guides Section */}
            {results.guides && results.guides.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📚</span> Guides & Tips (
                  {results.guides.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.guides.map((guide, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGuideClick(guide.path)}
                      className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-400 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-emerald-600 mb-1">
                        {guide.title}
                      </div>
                      <div className="text-sm text-gray-500">{guide.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !query && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg text-gray-600">
              Enter a search term to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
