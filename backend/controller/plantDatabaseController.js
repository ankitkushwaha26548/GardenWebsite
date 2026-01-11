import plantApiService from '../services/plantApiService.js';

export const searchPlants = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    console.log(`Controller searching for: ${query}`);
    const plants = await plantApiService.searchPlants(query);

    res.json({
      success: true,
      query,
      count: plants.length,
      data: plants
    });

  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search plants'
    });
  }
};

export const getPlantDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Plant ID is required'
      });
    }

    const plant = await plantApiService.getPlantDetails(id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: 'Plant not found'
      });
    }

    res.json({
      success: true,
      data: plant
    });

  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch plant details'
    });
  }
};

export const getApiStatus = async (req, res) => {
  try {
    // Test API connection with a simple search
    await plantApiService.searchPlants('rose');
    
    res.json({
      success: true,
      message: 'API is connected and working',
      api: 'Perenual API'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'API connection failed',
      message: error.message
    });
  }
};