import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Garden Photo",
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String, // Base64 or URL
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // ✅ Add index for efficient sorting
    },
  },
  { timestamps: true }
);

// Create index for createdAt to avoid memory limit errors during sorting
gallerySchema.index({ createdAt: -1 });

export default mongoose.model("Gallery", gallerySchema);
