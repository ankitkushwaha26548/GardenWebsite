// routes/plants.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { 
  addUserPlant, 
  getUserPlants, 
  deleteUserPlant
} from "../controller/plantCon.js";

const router = express.Router();

// ============ USER PLANT ENDPOINTS (PROTECTED) ============

// Create plant (protected)
router.post("/", authMiddleware, async (req, res) => {
  req.body.userId = req.user.userId;
  await addUserPlant(req, res);
});

// Read user's plants (protected)
router.get("/user", authMiddleware, async (req, res) => {
  req.params.userId = req.user.userId;
  await getUserPlants(req, res);
});

// Get specific user's plants by userId
router.get("/user/:userId", authMiddleware, async (req, res) => {
  await getUserPlants(req, res);
});

// Delete plant (protected)
router.delete("/:plantId", authMiddleware, async (req, res) => {
  await deleteUserPlant(req, res);
});

export default router;