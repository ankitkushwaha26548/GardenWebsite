import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    content: {
      type: String,
      required: true,
      minlength: 10
    },
    image: {
      type: String,
      default: null
    },
    author: {
      type: String,
      default: "Anonymous"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    },
    category: {
      type: String,
      enum: ["Tips", "Guide", "Experience", "News", "Other"],
      default: "Other"
    },
    tags: [{ type: String, trim: true }],
    views: {
      type: Number,
      default: 0
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

blogSchema.pre(/^find/, function () {
  this.populate("userId", "name email profileImage");
  this.populate("likedBy", "name");
});

export default mongoose.model("Blog", blogSchema);
