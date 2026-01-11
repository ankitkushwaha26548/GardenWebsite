import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      default: null
    },
    userProfileImage: {
      type: String,
      default: null
    },
    text: {
      type: String,
      required: true,
      minlength: 10,
      trim: true
    },
    image: {
      type: String,
      default: null
    },
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

storySchema.pre(/^find/, function () {
  this.populate("userId", "name profileImage");
  this.populate("likedBy", "name");
});

export default mongoose.model("Story", storySchema);
