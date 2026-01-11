import React from 'react';

const PlantCard = ({ plant, onClick }) => {
  // Check if this is a "My Plant" (user's collection)
  const isMyPlant = plant.type === "My Plant";

  return (
    <div 
className="bg-white rounded-2xl shadow-md 
           hover:shadow-2xl transition-all duration-300 
           overflow-hidden cursor-pointer 
           transform hover:-translate-y-2 hover:scale-[1.01]
           border border-gray-100 group"
      onClick={() => onClick(plant)}
    >
      {/* For My Plants - Simple card with just name and button */}
      {isMyPlant ? (
        <div className="p-6 flex flex-col justify-between h-full rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
  <div>
    {/* Header Strip */}
    <div className=" p-5 text-emerald-600 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold tracking-tight">{plant.name}</h2>
    </div>

    {/* About Section */}
    {plant.about && (
      <div className="mt-5">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">About</p>
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
          {plant.about}
        </p>
      </div>
    )}

    {/* Quick Info Grid */}
    {(plant.sunlight || plant.watering) && (
      <div className="grid grid-cols-2 gap-4 mt-6">
        {plant.sunlight && plant.sunlight !== "Not specified" && (
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <p className="text-xs text-yellow-700 font-semibold mb-1">☀️ Sunlight</p>
            <p className="text-sm text-yellow-900">{plant.sunlight}</p>
          </div>
        )}
        {plant.watering && plant.watering !== "Not specified" && (
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 border border-blue-200 shadow-sm">
            <p className="text-xs text-blue-700 font-semibold mb-1">💧 Watering</p>
            <p className="text-sm text-blue-900">{plant.watering}</p>
          </div>
        )}
      </div>
    )}
  </div>

  {/* Button */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(plant);
    }}
    className="mt-6 w-full cursor-pointer text-gray-600 hover:bg-gray-100 py-3 rounded-xl transition-transform duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.03]"
  >
    View Full Details
  </button>
</div>
      ) : (
        /* For Database Plants - Show all details */
        <>
          {/* Plant Name Header */}
          <div className="p-5 text-gray-800 border-b border-gray-200 bg-green-50">
            <h2 className="text-xl font-bold mb-1">{plant.name}</h2>
            {plant.commonName && (
              <p className="text-sm text-green-100">Common: {plant.commonName}</p>
            )}
          </div>
          
          {/* Plant Info Content */}
          <div className="p-5 space-y-4">
            {/* Botanical Name */}
            {plant.botanicalName && (
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Botanical Name</p>
                <p className="text-sm text-gray-700 italic">{plant.botanicalName}</p>
              </div>
            )}
            
            {/* About Section */}
            {plant.about && (
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">About</p>
                <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                  {plant.about}
                </p>
              </div>
            )}
            
            {/* Care Instructions */}
            {plant.careInstructions && plant.careInstructions !== "Not specified" && (
              <div className="border-b border-gray-200 pb-3">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Care Instructions</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {plant.careInstructions}
                </p>
              </div>
            )}
            
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {plant.sunlight && plant.sunlight !== "Not specified" && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 font-medium mb-1">☀️ Sunlight</p>
                  <p className="text-xs text-yellow-900 line-clamp-2">{plant.sunlight}</p>
                </div>
              )}
              {plant.watering && plant.watering !== "Not specified" && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium mb-1">💧 Watering</p>
                  <p className="text-xs text-blue-900 line-clamp-2">{plant.watering}</p>
                </div>
              )}
              {plant.soilType && plant.soilType !== "Not specified" && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-700 font-medium mb-1">🌱 Soil</p>
                    <p className="text-xs text-amber-900 line-clamp-2">{plant.soilType}</p>
                </div>
              )}
              {plant.climate && plant.climate !== "Not specified" && (
                <div className="bg-teal-50 rounded-lg p-3">
                  <p className="text-xs text-teal-700 font-medium mb-1">🌍 Climate</p>
                  <p className="text-xs text-teal-900 line-clamp-2">{plant.climate}</p>
                </div>
              )}
            </div>

            {/* Location (for user plants) */}
            {plant.location && (
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-700 font-medium mb-1">📍 Location</p>
                <p className="text-xs text-purple-900">{plant.location}</p>
              </div>
            )}
            
            {/* View Details Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick(plant);
              }}
              className="w-full text-gray-600 hover:bg-gray-100 py-2.5 rounded-lg transition-colors text-sm font-medium shadow-sm">
              View Full Details
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlantCard;