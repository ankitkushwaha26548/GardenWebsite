import mongoose from "mongoose";

const plantCareScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPlant",
      required: true,
    },
    plantName: {
      type: String,
      required: true,
    },
    careType: {
      type: String,
      enum: ["watering", "pruning", "fertilizer", "repotting", "pest-check", "spraying", "other"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "biweekly", "monthly", "quarterly"],
      default: "once",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlantCareSchedule", plantCareScheduleSchema);
