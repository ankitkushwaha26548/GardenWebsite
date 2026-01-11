// backend/models/Plant.js
import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({
  api_id: { type: String, index: true, unique: false, sparse: true },
  name: { type: String, required: true },
  type: { type: String, default: "Unknown" },
  botanicalName: { type: String, default: "" },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  moreUrl: { type: String, default: "" },
  
  // CARE INFORMATION - All detailed care tips
  care: {
    watering: [String],           // Array of watering tips
    sunlight: [String],           // Array of sunlight tips
    soil: [String],               // Array of soil tips
    fertilizer: [String],         // Array of fertilizer tips
    temperature: [String],        // Array of temperature tips
    pests: [String],              // Array of pest tips
    pruning: [String],            // Array of pruning tips
    seasonalTips: [String]        // Array of seasonal tips
  }
}, { timestamps: true });

plantSchema.index({ name: "text", description: "text", type: "text" });

export default mongoose.models.Plant || mongoose.model("Plant", plantSchema);
