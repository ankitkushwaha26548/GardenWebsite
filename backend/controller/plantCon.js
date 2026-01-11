// controller/plantCon.js
import UserPlant from "../models/UserPlant.js";
import Plant from "../models/Plant.js";
import plantApiService from "../services/plantApiService.js";
import { getPlantSuggestions as getFuzzySuggestions } from "../utils/nameMatcher.js";

// ADD USER PLANT WITH MULTI-API + NAME MATCHING
const addUserPlant = async (req, res) => {
  try {
    const { userId, customName, actualName, location } = req.body;

    if (!actualName || actualName.trim() === '') {
      return res.status(400).json({ 
        error: "Plant name is required",
        suggestion: "Please enter a plant name like 'rose', 'snake plant', or 'aloe vera'"
      });
    }

    const plantName = actualName.trim();
    let plantData = null;
    let source = "api";
    let nameCorrection = null;

    console.log(`🌿 Processing plant: ${plantName}`);

    // First, try to find in Plant collection (plantCareDatabase)
    let dbPlant = await Plant.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${plantName}$`, 'i') } },
        { botanicalName: { $regex: new RegExp(`^${plantName}$`, 'i') } }
      ]
    });

    if (dbPlant) {
      console.log(`✅ Found plant in database: ${dbPlant.name}`);
      plantData = {
        commonName: dbPlant.name,
        scientificName: dbPlant.botanicalName || "Unknown",
        type: dbPlant.type,
        care: dbPlant.care,
        description: dbPlant.description
      };
      source = "plantCareDatabase";
    } else {
      // If not in database, try APIs
      console.log(`🔍 Not found in database, searching APIs...`);
      const apiResult = await plantApiService.identifyPlant(plantName);
      
      if (apiResult) {
        plantData = {
          commonName: apiResult.name,
          scientificName: apiResult.scientificName,
          type: "unknown",
          care: apiResult.care,
          description: apiResult.description
        };
        
        source = `api_${apiResult.api}`;
        
        // Track name correction if any
        if (apiResult.correctedName) {
          nameCorrection = {
            original: plantName,
            corrected: apiResult.correctedName
          };
        }
      } else {
        // No API found the plant
        plantData = {
          commonName: plantName,
          scientificName: "Unknown",
          type: "unknown", 
          care: plantApiService.getGenericCare(),
          description: `Custom plant: ${plantName}`
        };
        source = "generic_template";
      }
    }

    console.log(`Plant identified via: ${source}`);

    // Save to database
    const plant = new UserPlant({
      userId,
      customName: customName || plantData.commonName,
      actualName: plantName,
      commonName: plantData.commonName,
      scientificName: plantData.scientificName,
      plantType: plantData.type,
      location: location || "Home",
      about: plantData.description || `${plantName} is a beautiful plant that adds charm and greenery to any space.`,
      care: plantData.care,
      careSource: source,
      nameCorrection: nameCorrection
    });

    await plant.save();

    // Prepare response message
    let message = `🌿 ${plantData.commonName} added successfully!`;
    let note = getSourceNote(source);
    
    if (nameCorrection) {
      note += ` (Name corrected from "${nameCorrection.original}")`;
    }

    if (source === "generic_template") {
      note += " - You can edit care details later";
    }

    res.json({ 
      message,
      plant: {
        ...plant.toObject(),
        careSource: source
      },
      note,
      nameCorrection
    });

  } catch (error) {
    console.log("Error adding plant:", error.message);
    
    // Provide helpful error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Invalid plant data",
        details: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "Plant already exists",
        suggestion: "This plant may already be in your collection"
      });
    }

    res.status(500).json({ 
      error: "Failed to add plant to your collection",
      details: "Please try again with a different plant name or check your connection"
    });
  }
};

// GET ALL USER PLANTS
const getUserPlants = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.userId || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log(` Fetching plants for user ${userId}`);
    const plants = await UserPlant.find({ userId }).sort({ dateAdded: -1 });
    console.log(`Fetched ${plants.length} plants`);
    
    res.json(plants);
  } catch (error) {
    console.error("Error fetching user plants:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE USER PLANT
const deleteUserPlant = async (req, res) => {
  try {
    const { plantId } = req.params;
    
    if (!plantId) {
      return res.status(400).json({ error: "Plant ID is required" });
    }

    const result = await UserPlant.findByIdAndDelete(plantId);
    
    if (!result) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json({ 
      message: "Plant deleted successfully",
      deletedPlant: result
    });
  } catch (error) {
    console.error("Error deleting plant:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET PLANT SUGGESTIONS (using fuzzy matching)
const getPlantSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    console.log(` Getting suggestions for: ${query}`);
    
    // Get suggestions from fuzzy matcher
    const suggestions = getFuzzySuggestions(query);
    
    // Also try to get some from API cache if available
    const apiSuggestions = [];
    
    res.json({
      fuzzyMatches: suggestions,
      apiSuggestions: apiSuggestions,
      note: suggestions.length > 0 ? 
        "Try these common plant names:" : 
        "Enter a common plant name like 'rose', 'snake plant', or 'mint'"
    });
  } catch (error) {
    console.error(" Error getting suggestions:", error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PLANT CARE INFO
const updatePlantCare = async (req, res) => {
  try {
    const { plantId } = req.params;
    const { care } = req.body;

    if (!plantId || !care) {
      return res.status(400).json({ error: "Plant ID and care data are required" });
    }

    const updatedPlant = await UserPlant.findByIdAndUpdate(
      plantId,
      { 
        care,
        careSource: "user_edited",
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedPlant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json({
      message: "Plant care updated successfully",
      plant: updatedPlant
    });
  } catch (error) {
    console.error("Error updating plant care:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function for source notes
const getSourceNote = (source) => {
  const notes = {
    "api_perenual": "Care information from Perenual Plant Database",
    "api_trefle": "Care information from Trefle API", 
    "generic_template": "General plant care guidelines - you can customize these",
    "user_edited": "Custom care instructions"
  };
  return notes[source] || "Plant care information";
};

export { 
  addUserPlant, 
  getUserPlants, 
  deleteUserPlant,
  getPlantSuggestions,
  updatePlantCare
};