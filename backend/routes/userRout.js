import express from "express";
import { registerUser, loginUser, changePassword } from "../controller/userCon.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Password change requires authentication
router.post("/change-password", authMiddleware, changePassword);

export default router;
