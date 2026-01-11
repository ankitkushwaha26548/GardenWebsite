import express from "express";
import { 
  saveUserProfile, 
  getUserProfile, 
  updateLoginStats, 
  getUserStats,
  uploadAvatar
} from "../controller/profileCon.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All profile routes require authentication
router.use(authMiddleware);

// Save or update user profile
router.post("/", saveUserProfile);
router.put("/", saveUserProfile); // Also support PUT for updates

// Get user profile
router.get("/", getUserProfile);
router.get("/get", getUserProfile); // Support /get for backward compatibility

// Update login stats
router.post("/login-stats", updateLoginStats);

// Get all user stats (with user info + profile)
router.get("/stats", getUserStats);

// Upload avatar
router.post("/avatar", uploadAvatar);

export default router;
