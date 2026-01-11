import mongoose from "mongoose";

const userPlantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // User's plant info
  customName: String,
  actualName: String,
  commonName: String,
  scientificName: String,
  plantType: String,
  dateAdded: { type: Date, default: Date.now },
  location: String,
  imageUrl: String,

  // Plant description/about
  about: String,

  // Auto-fetched care details
  care: {
    watering: { type: [String], default: [] },
    sunlight: { type: [String], default: [] },
    soil: { type: [String], default: [] },
    fertilizer: { type: [String], default: [] },
    temperature: { type: [String], default: [] },
    pests: { type: [String], default: [] },
    pruning: { type: [String], default: [] },
    seasonalTips: { type: [String], default: [] }
  },

  // Data source tracking
  careSource: { type: String, default: "generic_template" },
  nameCorrection: {
    original: String,
    corrected: String
  },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("UserPlant", userPlantSchema);
