
import React, { useEffect, useState } from "react";
import { fetchPlant } from "../api/api";
import PlantCard from "./PlantCard";

export default function PlantDetails({ plantId }) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plantId) {
      setPlant(null);
      return;
    }

    let ignore = false;
    setLoading(true);
    setError("");

    fetchPlant(plantId)
      .then((data) => {
        if (!ignore) setPlant(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Unable to load plant details.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [plantId]);

  if (!plantId) {
    return (
      <div className="plant-details__placeholder">
        Search or pick a plant to view its care profile.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="plant-details__placeholder">
        Loading care instructions...
      </div>
    );
  }

  if (error) {
    return <div className="plant-details__placeholder">{error}</div>;
  }

  if (!plant) {
    return (
      <div className="plant-details__placeholder">Plant not found right now.</div>
    );
  }

  return (
    <div className="plant-details-panel">
      <PlantCard plant={plant} isActive />

      <section className="plant-details__section">
        <div>
          <h3>About this plant</h3>
          {(plant.about && plant.about.length > 0
            ? plant.about
            : [plant.description]
          ).map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="plant-details__section">
        <h3>Care instructions</h3>
        <div className="care-grid">
          <div className="care-card">
            <p className="care-label">Watering</p>
            <p>{Array.isArray(plant.care?.watering) && plant.care.watering.length > 0 
              ? plant.care.watering.join(", ") 
              : (plant.care?.watering || "Keep soil evenly moist.")}</p>
          </div>
          <div className="care-card">
            <p className="care-label">Sunlight</p>
            <p>{Array.isArray(plant.care?.sunlight) && plant.care.sunlight.length > 0 
              ? plant.care.sunlight.join(", ") 
              : (plant.care?.sunlight || "Bright, indirect light.")}</p>
          </div>
          <div className="care-card">
            <p className="care-label">Soil</p>
            <p>{Array.isArray(plant.care?.soil) && plant.care.soil.length > 0 
              ? plant.care.soil.join(", ") 
              : (plant.care?.soil || "Well-draining potting mix.")}</p>
          </div>
          <div className="care-card">
            <p className="care-label">Fertilizer</p>
            <p>{Array.isArray(plant.care?.fertilizer) && plant.care.fertilizer.length > 0 
              ? plant.care.fertilizer.join(", ") 
              : (plant.care?.fertilizer || "Balanced fertilizer monthly.")}</p>
          </div>
        </div>
      </section>

      {plant.designTips && (
        <section className="plant-details__section design-tip">
          <h3>Design tip</h3>
          <p>{plant.designTips}</p>
        </section>
      )}
    </div>
  );
}

