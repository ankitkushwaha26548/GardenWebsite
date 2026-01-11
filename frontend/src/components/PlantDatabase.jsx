import React, { useState, useEffect } from "react";
import PlantCard from "./PlantCard";
import plantService from "../services/plantService";
import { getUserPlants } from "../api/api";

export default function PlantDatabase() {
  const [plants, setPlants] = useState([]);
  const [userPlants, setUserPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUserPlants, setLoadingUserPlants] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("myplants");

  useEffect(() => {
    checkApiStatus();
    fetchUserPlants();
  }, []);

  const checkApiStatus = async () => {
    const status = await plantService.checkApiStatus();
    setApiStatus(status);
  };

  const fetchUserPlants = async () => {
    setLoadingUserPlants(true);
    try {
      const plants = await getUserPlants();

      const transformedPlants = plants.map(plant => ({
        _id: plant._id,
        name: plant.customName || plant.actualName,
        common_name: plant.actualName,
        botanical_name: plant.botanicalName || plant.actualName,
        about: plant.about || "This is a beautiful plant that adds charm and greenery to any space.",
        care_instructions: plant.care?.pruning?.[0] || "Not specified",
        soil_type: plant.care?.soil?.[0] || "Not specified",
        climate: plant.care?.temperature?.[0] || "Not specified",
        sunlight: plant.care?.sunlight?.[0] || "Not specified",
        watering: plant.care?.watering?.[0] || "Not specified",
        fertilizer: plant.care?.fertilizer?.[0] || "Not specified",
        pests: plant.care?.pests?.[0] || "Not specified",
        seasonalTips: plant.care?.seasonalTips?.[0] || "Not specified",
        toxicity: "Not specified",
        type: "My Plant",
        image: plant.imageUrl || "🌿",
        fullCare: plant.care // Store full care data
      }));

      setUserPlants(transformedPlants);
    } catch {
      setUserPlants([]);
    } finally {
      setLoadingUserPlants(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return setError("Please enter a plant name");

    setLoading(true);
    setError("");
    setPlants([]);

    try {
      const results = await plantService.searchPlants(searchTerm);

      const transformedResults = results.map(plant => ({
        _id: plant._id || plant.id,
        name: plant.name || plant.common_name || "Unknown",
        common_name: plant.name || plant.common_name || "Unknown",
        botanical_name: plant.botanicalName || plant.botanical_name || "Unknown",
        about: plant.about || plant.description || "No description available",
        care_instructions: plant.care_instruction || plant.care_instructions || plant.careInstructions || "Not specified",
        soil_type: plant.soil || plant.soil_type || "Not specified",
        climate: plant.climate || "Not specified",
        sunlight: plant.sunlight || "Not specified",
        watering: plant.watering || "Not specified",
        toxicity: plant.toxicity || "Not specified",
        type: "Database Plant",
        image: plant.image || "🌿",
      }));

      setPlants(transformedResults);

      if (!transformedResults.length)
        setError(`No plants found for "${searchTerm}"`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openPlantDetails = async (plant) => {
    // If it's a "My Plant", fetch complete data from local database via search
    if (plant.type === "My Plant") {
      try {
        const results = await plantService.searchPlants(plant.common_name);
        if (results && results.length > 0) {
          const fullPlantData = results[0];
          setSelectedPlant({
            ...plant,
            ...fullPlantData,
            type: "My Plant", // Keep the type to show only about in modal
            common_name: plant.name // Use the user's custom name
          });
        } else {
          setSelectedPlant(plant);
        }
      } catch (error) {
        console.log("Error fetching plant details:", error);
        setSelectedPlant(plant);
      }
    } else {
      setSelectedPlant(plant);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlant(null);
  };

  // Get display about and care instructions with fallbacks
  const getDisplayAbout = (plant) => {
    if (plant.about && plant.about.trim() && plant.about !== "No description available") {
      return plant.about;
    }
    // Fallback about content
    return `${plant.common_name} is a beautiful plant. This plant adds charm and greenery to any space. For best results, follow the care instructions provided below.`;
  };

  const getDisplayCareInstructions = (plant) => {
    if (plant.care_instructions && plant.care_instructions.trim() && plant.care_instructions !== "Not specified") {
      return plant.care_instructions;
    }
    // Fallback care instructions
    return `Sunlight: ${plant.sunlight}\nWatering: ${plant.watering}\nSoil: ${plant.soil_type}\nClimate: ${plant.climate}\n\nGeneral Care Tips:\n• Water regularly and ensure soil doesn't completely dry out\n• Place in appropriate lighting conditions\n• Use well-draining soil\n• Keep away from extreme temperatures\n• Repot annually or when needed\n• Check regularly for pests and diseases`;
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 p-6
                animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-center text-[#37604b] mb-2">
  🌿 Plant Database
</h1>
          <p className="text-lg text-gray-600">
            Explore plants or manage your collection
          </p>



          {/* TABS */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setActiveTab("myplants")}
              className={`relative px-6 py-3 rounded-xl transition-all duration-300
  ${activeTab === "myplants"
    ? "bg-green-100 border text-black shadow-lg"
    : "bg-white border hover:bg-green-50"}`}
            >
              📋 My Plants ({userPlants.length})
            </button>

            <button
              onClick={() => setActiveTab("search")}
              className={`relative px-6 py-3 rounded-xl transition-all duration-300
  ${activeTab === "myplants"
    ? "bg-white border hover:bg-green-50"
    : "bg-green-100 border text-black shadow-lg"}
`}
            >
              🔍 Search Database
            </button>
          </div>
        </div>

        {/* SEARCH TAB */}
        {activeTab === "search" && (
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                placeholder="Search for plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 border rounded-xl"
              />

              <button
                type="submit"
                className="bg-green-600 text-white px-6 rounded-xl"
              >
                Search
              </button>
            </form>

            {error && (
              <p className="mt-3 text-red-600 text-center">{error}</p>
            )}
          </div>
        )}

        {/* SEARCH RESULTS */}
        {!loading && activeTab === "search" && plants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {plants.map((p) => (
              <PlantCard key={p._id} plant={p} onClick={openPlantDetails} />
            ))}
          </div>
        )}

        {/* MY PLANTS TAB */}
        {activeTab === "myplants" && !loadingUserPlants && userPlants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {userPlants.map((p) => (
              <PlantCard key={p._id} plant={p} onClick={openPlantDetails} />
            ))}
          </div>
        )}

        {/* MODAL */}
        {showModal && selectedPlant && (
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm 
                flex items-start justify-center 
                p-4 pt-5 z-50
                animate-fadeIn">

<div className="bg-white rounded-2xl w-full max-w-3xl p-6 
                max-h-[90vh] overflow-y-auto 
                shadow-2xl transform transition-all duration-300 
                animate-scaleIn">

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPlant.type === "My Plant" ? selectedPlant.name : selectedPlant.common_name}</h2>
                  {selectedPlant.type === "My Plant" ? (
                    <p className="text-gray-600">Species: {selectedPlant.common_name}</p>
                  ) : (
                    <p className="text-gray-600 italic">
                      {selectedPlant.botanical_name}
                    </p>
                  )}
                </div>

                <button onClick={closeModal} className="text-2xl">
                  ✕
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 bg-green-100 rounded-xl flex items-center justify-center text-6xl">
                  {selectedPlant.image}
                </div>
              </div>

              {/* For My Plants - Show all plant care info */}
              {selectedPlant.type === "My Plant" ? (
                <>
                  <section className="mb-6">
                    <h3 className="font-bold mb-4 text-lg">📖 About This Plant</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedPlant.about && selectedPlant.about !== "No description available" 
                        ? selectedPlant.about 
                        : "No description available for this plant"}
                    </p>
                  </section>

                  <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPlant.fullCare?.watering && selectedPlant.fullCare.watering.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <h4 className="font-semibold text-blue-700">💧 Watering</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.watering.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {selectedPlant.fullCare?.sunlight && selectedPlant.fullCare.sunlight.length > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-xl">
                        <h4 className="font-semibold text-yellow-700">☀️ Sunlight</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.sunlight.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {selectedPlant.fullCare?.soil && selectedPlant.fullCare.soil.length > 0 && (
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <h4 className="font-semibold text-amber-700">🌱 Soil</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.soil.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {selectedPlant.fullCare?.temperature && selectedPlant.fullCare.temperature.length > 0 && (
                      <div className="p-4 bg-orange-50 rounded-xl">
                        <h4 className="font-semibold text-orange-700">🌡️ Temperature</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.temperature.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {selectedPlant.fullCare?.fertilizer && selectedPlant.fullCare.fertilizer.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-xl">
                        <h4 className="font-semibold text-green-700">🌿 Fertilizer</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.fertilizer.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {selectedPlant.fullCare?.pruning && selectedPlant.fullCare.pruning.length > 0 && (
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <h4 className="font-semibold text-purple-700">✂️ Pruning</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.pruning.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {selectedPlant.fullCare?.pests && selectedPlant.fullCare.pests.length > 0 && (
                      <div className="p-4 bg-red-50 rounded-xl">
                        <h4 className="font-semibold text-red-700">🐛 Pests & Diseases</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.pests.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {selectedPlant.fullCare?.seasonalTips && selectedPlant.fullCare.seasonalTips.length > 0 && (
                      <div className="p-4 bg-teal-50 rounded-xl">
                        <h4 className="font-semibold text-teal-700">📅 Seasonal Tips</h4>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {selectedPlant.fullCare.seasonalTips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                /* For Database Plants - Show all details */
                <>
                  <section className="mb-6">
                    <h3 className="font-bold mb-2">About</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {getDisplayAbout(selectedPlant)}
                    </p>
                  </section>

                  <section className="mb-6">
                    <h3 className="font-bold mb-2">Care Instructions</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {getDisplayCareInstructions(selectedPlant)}
                    </p>
                  </section>

                  <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold">Soil Type</h4>
                      <p>{selectedPlant.soil_type}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold">Climate</h4>
                      <p>{selectedPlant.climate}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold">Toxicity</h4>
                      <p>{selectedPlant.toxicity}</p>
                    </div>
                  </section>
                </>
              )}

              <button
                onClick={closeModal}
                className="w-full bg-green-600 text-white py-3 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}