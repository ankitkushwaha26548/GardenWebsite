import express from "express";
import {
  getAllGallery,
  getUserGallery,
  addGalleryPost,
  likePost,
  addComment,
  deleteGalleryPost,
  updateGalleryPost,
} from "../controller/galleryCon.js";

const router = express.Router();

// Get all gallery posts (public)
router.get("/", getAllGallery);

// Get user's gallery posts
router.get("/user/:userId", getUserGallery);

// Add new gallery post
router.post("/add", addGalleryPost);

// Like/Unlike a post
router.post("/like", likePost);

// Add comment
router.post("/comment", addComment);

// Update gallery post
router.put("/:postId", updateGalleryPost);

// Delete gallery post
router.delete("/:postId", deleteGalleryPost);

export default router;
