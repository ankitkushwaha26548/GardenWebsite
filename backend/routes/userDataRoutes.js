import express from "express";
import { saveUserData, getUserData } from "../controller/userDataCon.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Save user data on login
router.post("/save", saveUserData);

// Get user data
router.get("/", getUserData);

export default router;
