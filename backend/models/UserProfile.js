import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true 
  },
  
  // Profile Information
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  
  // Gardening Preferences
  gardenType: { type: String, enum: ["Indoor", "Outdoor", "Balcony", "Other"], default: "Outdoor" },
  experience: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  favoriteCategories: { type: [String], default: [] },
  
  // Activity Tracking
  totalPlantsAdded: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserProfile", userProfileSchema);
