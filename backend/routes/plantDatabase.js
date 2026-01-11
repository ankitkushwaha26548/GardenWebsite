import express from 'express';
import {
  searchPlants,
  getPlantDetails,
  getApiStatus
} from '../controller/plantDatabaseController.js';

const router = express.Router();

// GET /api/plant-database/search - Search plants
router.get('/search', searchPlants);

// GET /api/plant-database/status - Check API status
router.get('/status', getApiStatus);

// GET /api/plant-database/:id - Get plant details by ID
router.get('/:id', getPlantDetails);

export default router;