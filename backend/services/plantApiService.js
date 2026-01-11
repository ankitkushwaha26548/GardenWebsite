// services/plantApiService.js
import axios from 'axios';
import { fuzzyMatchPlantName } from '../utils/nameMatcher.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load plant data
let plantDataCache = [];
function loadPlantData() {
  try {
    const dataPath = path.join(__dirname, '../data/plantData.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    plantDataCache = JSON.parse(data);
    console.log(`✅ Loaded ${plantDataCache.length} plants from plantData.json`);
    return plantDataCache;
  } catch (error) {
    console.log('⚠️ Could not load plantData.json:', error.message);
    return [];
  }
}

class PlantApiService {
  constructor() {
    // Load plant database
    this.plantData = loadPlantData();
    
    this.apis = [
      {
        name: 'perenual',
        baseUrl: 'https://perenual.com/api',
        key: process.env.PERENUAL_KEY,
        identify: this.identifyPerenual.bind(this),
        priority: 1
      },
      {
        name: 'trefle',
        baseUrl: 'https://trefle.io/api/v1',
        key: process.env.TREFLE_API_KEY,
        identify: this.identifyTrefle.bind(this),
        priority: 2
      }
    ];
    
    // Cache to avoid duplicate API calls
    this.cache = new Map();
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Perenual API implementation
  async identifyPerenual(plantName, apiConfig) {
    const cacheKey = `perenual_${plantName}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      console.log(`🔍 Searching Perenual for: ${plantName}`);
      
      const searchResponse = await axios.get(
        `${apiConfig.baseUrl}/species-list`,
        {
          params: {
            key: apiConfig.key,
            q: plantName,
            page: 1
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (searchResponse.data.data && searchResponse.data.data.length > 0) {
        const plant = searchResponse.data.data[0];
        const plantId = plant.id;

        let careGuide = {};
        try {
          const careResponse = await axios.get(
            `${apiConfig.baseUrl}/species-care-guide-list`,
            {
              params: {
                key: apiConfig.key,
                species_id: plantId
              },
              timeout: 10000
            }
          );
          careGuide = careResponse.data.data?.[0] || {};
        } catch (careError) {
          console.log('⚠️ Could not fetch care guide, using basic info');
        }

        const result = {
          name: plant.common_name || plantName,
          scientificName: plant.scientific_name?.[0] || 'Unknown',
          description: plant.description || `Care information for ${plant.common_name || plantName}`,
          care: this.parseCareGuide(careGuide),
          api: 'perenual',
          confidence: 'high'
        };

        this.setCache(cacheKey, result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.log(`❌ Perenual API error: ${error.message}`);
      if (error.response?.status === 429) {
        console.log('⚠️ Perenual rate limit exceeded');
      }
      return null;
    }
  }

  // Trefle API implementation
  async identifyTrefle(plantName, apiConfig) {
    const cacheKey = `trefle_${plantName}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      console.log(`🔍 Searching Trefle for: ${plantName}`);
      
      const searchResponse = await axios.get(
        `${apiConfig.baseUrl}/plants/search`,
        {
          params: {
            token: apiConfig.key,
            q: plantName
          },
          timeout: 10000
        }
      );

      if (searchResponse.data.data && searchResponse.data.data.length > 0) {
        const plant = searchResponse.data.data[0];
        
        let details = {};
        try {
          if (plant.id) {
            const detailResponse = await axios.get(
              `${apiConfig.baseUrl}/plants/${plant.id}`,
              {
                params: { token: apiConfig.key },
                timeout: 10000
              }
            );
            details = detailResponse.data.data || {};
          }
        } catch (detailError) {
          console.log('⚠️ Could not fetch plant details');
        }

        const result = {
          name: plant.common_name || plant.scientific_name || plantName,
          scientificName: plant.scientific_name || 'Unknown',
          family: plant.family || details.family,
          description: details.observations || `Plant information for ${plant.common_name || plantName}`,
          care: this.generateTrefleCare(details),
          api: 'trefle',
          confidence: plant.common_name ? 'high' : 'medium'
        };

        this.setCache(cacheKey, result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.log(`❌ Trefle API error: ${error.message}`);
      return null;
    }
  }

  // Main identification function with name correction
  async identifyPlant(plantName) {
    // First, correct the plant name using fuzzy matching
    const correctedName = fuzzyMatchPlantName(plantName);
    console.log(`📝 Name correction: "${plantName}" → "${correctedName}"`);

    // Sort APIs by priority
    const sortedApis = this.apis
      .filter(api => api.key && api.key !== 'your_key_here') // Only use configured APIs
      .sort((a, b) => a.priority - b.priority);

    // Try with corrected name first
    for (const api of sortedApis) {
      try {
        const result = await api.identify(correctedName, api);
        if (result) {
          // Add name correction info to result
          if (correctedName !== plantName.toLowerCase()) {
            result.originalQuery = plantName;
            result.correctedName = correctedName;
          }
          return result;
        }
      } catch (error) {
        console.log(`❌ ${api.name} API failed: ${error.message}`);
        continue;
      }
    }

    // If corrected name didn't work, try original name
    if (correctedName !== plantName.toLowerCase()) {
      for (const api of sortedApis) {
        try {
          const result = await api.identify(plantName, api);
          if (result) return result;
        } catch (error) {
          continue;
        }
      }
    }

    return null;
  }

  // Helper methods
  parseCareGuide(guide) {
    const care = this.getGenericCare();

    if (!guide || !guide.section) {
      return care;
    }

    guide.section.forEach(sec => {
      if (care[sec.type] !== undefined && sec.description) {
        care[sec.type] = [sec.description];
      }
    });

    return care;
  }

  generateTrefleCare(details) {
    const care = this.getGenericCare();
    
    if (details.growth) {
      if (details.growth.ph_minimum) {
        care.soil.push(`Preferred pH: ${details.growth.ph_minimum} - ${details.growth.ph_maximum}`);
      }
      if (details.growth.light) {
        care.sunlight.push(`Light: ${details.growth.light}`);
      }
      if (details.growth.atmospheric_humidity) {
        care.seasonalTips.push(`Humidity: ${details.growth.atmospheric_humidity}`);
      }
    }

    return care;
  }

  getGenericCare() {
    return {
      watering: ["Water when the top inch of soil feels dry", "Adjust watering frequency based on season and environment"],
      sunlight: ["Provide appropriate light conditions - most plants prefer bright indirect light"],
      soil: ["Use well-draining potting mix suitable for plant type"],
      fertilizer: ["Feed with balanced fertilizer during active growing season", "Reduce feeding in winter"],
      temperature: ["Maintain temperatures between 18-24°C for most plants", "Avoid drafts and sudden temperature changes"],
      pests: ["Regularly inspect for common pests", "Treat infestations early with appropriate methods"],
      pruning: ["Remove dead or yellowing leaves", "Prune to maintain shape and encourage growth"],
      seasonalTips: ["Reduce watering in winter", "Increase humidity in dry conditions", "Rotate plant for even growth"]
    };
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    
    const cached = this.cache.get(key);
    return (Date.now() - cached.timestamp) < this.cacheDuration;
  }

  // Clear expired cache entries
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheDuration) {
        this.cache.delete(key);
      }
    }
  }

  // Search plants - used by PlantDatabase controller
  // Uses ALL THREE APIs to get maximum results
  async searchPlants(query) {
    try {
      console.log(`🔍 Service searching for: ${query}`);
      let allPlants = [];

      // PRIORITY 1: Search Local Database FIRST (plantData.json) - FASTEST
      console.log('🏠 Searching Local Database FIRST...');
      const localResults = this.searchLocalDatabase(query);
      
      if (localResults.length > 0) {
        console.log(`✅ Found ${localResults.length} plants from local database`);
        return localResults;
      }

      // PRIORITY 2: Search Perenual (most comprehensive database)
      const perenualApi = this.apis.find(api => api.name === 'perenual');
      if (perenualApi && perenualApi.key) {
        try {
          console.log('📍 Searching Perenual API...');
          const response = await axios.get(
            `${perenualApi.baseUrl}/species-list`,
            {
              params: {
                key: perenualApi.key,
                q: query,
                page: 1
              },
              timeout: 10000
            }
          );

          console.log(`✅ Perenual response: ${response.data.data?.length || 0} results`);
          
          if (response.data.data && response.data.data.length > 0) {
            const perenualPlants = response.data.data.slice(0, 5).map(plant => ({
              _id: `perenual_${plant.id}`,
              name: plant.common_name || query,
              botanicalName: plant.scientific_name?.[0] || 'Unknown',
              type: 'Plant',
              image: plant.default_image?.medium_url || plant.default_image?.original_url || '🌿',
              watering: plant.watering_general_benchmark?.value || 'Regular',
              sunlight: plant.sunlight?.[0] || 'Bright indirect light',
              about: plant.description || `Information about ${plant.common_name || query}`,
              description: plant.description || 'Plant from Perenual database',
              source: 'Perenual'
            }));
            allPlants = allPlants.concat(perenualPlants);
            console.log(`✅ Added ${perenualPlants.length} plants from Perenual`);
          }
        } catch (error) {
          console.log(`⚠️ Perenual search failed: ${error.message}`);
        }
      }

      // PRIORITY 3: Search Trefle (large plant database)
      const trefleApi = this.apis.find(api => api.name === 'trefle');
      if (trefleApi && trefleApi.key) {
        try {
          console.log('📍 Searching Trefle API...');
          const response = await axios.get(
            `${trefleApi.baseUrl}/plants/search`,
            {
              params: {
                token: trefleApi.key,
                q: query
              },
              timeout: 10000
            }
          );

          console.log(`✅ Trefle response: ${response.data.data?.length || 0} results`);

          if (response.data.data && response.data.data.length > 0) {
            const treflePlants = response.data.data.slice(0, 5).map(plant => ({
              _id: `trefle_${plant.id}`,
              name: plant.common_name || plant.scientific_name || query,
              botanicalName: plant.scientific_name || 'Unknown',
              type: plant.family || 'Plant',
              image: plant.image_url || '🌿',
              watering: 'Check care guide',
              sunlight: 'Varies by species',
              about: `${plant.common_name || plant.scientific_name} from Trefle database`,
              description: `Scientific name: ${plant.scientific_name}`,
              source: 'Trefle'
            }));
            allPlants = allPlants.concat(treflePlants);
            console.log(`✅ Added ${treflePlants.length} plants from Trefle`);
          }
        } catch (error) {
          console.log(`⚠️ Trefle search failed: ${error.message}`);
        }
      }

      // PRIORITY 4: Search Open Tree of Life (comprehensive taxonomic database - FREE)
      try {
        console.log('📍 Searching Open Tree of Life API...');
        const response = await axios.get(
          `https://api.opentreeoflife.org/v3/taxonomy/autocomplete`,
          {
            params: {
              name: query,
              context_name: 'Plants'
            },
            timeout: 10000
          }
        );

        console.log(`✅ Open Tree response: ${response.data.results?.length || 0} results`);

        if (response.data.results && response.data.results.length > 0) {
          const openTreePlants = response.data.results.slice(0, 5).map((plant, idx) => ({
            _id: `opentree_${plant.ott_id}`,
            name: plant.unique_name || query,
            botanicalName: plant.unique_name || 'Unknown',
            type: 'Plant',
            image: '🌿',
            watering: 'Research specific needs',
            sunlight: 'Varies by species',
            about: `${plant.unique_name} from Open Tree of Life taxonomy database`,
            description: `Taxonomic information available via Open Tree of Life`,
            source: 'Open Tree of Life'
          }));
          allPlants = allPlants.concat(openTreePlants);
          console.log(`✅ Added ${openTreePlants.length} plants from Open Tree of Life`);
        }
      } catch (error) {
        console.log(`⚠️ Open Tree of Life search failed: ${error.message}`);
      }

      // If we got results from APIs, return them
      if (allPlants.length > 0) {
        console.log(`🎉 Total plants from all APIs: ${allPlants.length}`);
        return allPlants;
      }

      // No results anywhere - return empty array
      console.log('❌ No plants found in any source');
      return [];
    } catch (error) {
      console.error('❌ Search error:', error);
      throw error;
    }
  }

  // Get plant details - used by PlantDatabase controller
  async getPlantDetails(plantId) {
    try {
      console.log(`📖 Fetching details for: ${plantId}`);

      // Parse which API the plant came from
      if (plantId.startsWith('perenual_')) {
        const id = plantId.replace('perenual_', '');
        const perenualApi = this.apis.find(api => api.name === 'perenual');
        
        if (perenualApi && perenualApi.key) {
          try {
            const careResponse = await axios.get(
              `${perenualApi.baseUrl}/species-care-guide-list`,
              {
                params: {
                  key: perenualApi.key,
                  species_id: id
                },
                timeout: 10000
              }
            );

            const guide = careResponse.data.data?.[0];
            const careInstructions = {};

            if (guide && guide.section) {
              guide.section.forEach(sec => {
                careInstructions[sec.type] = sec.description || 'See general care';
              });
            }

            return {
              _id: plantId,
              careInstructions: careInstructions,
              name: guide?.name || 'Plant Details',
              botanicalName: 'From Perenual',
              description: 'Complete care guide from Perenual database'
            };
          } catch (error) {
            console.log(`⚠️ Could not fetch Perenual details: ${error.message}`);
          }
        }
      } else if (plantId.startsWith('trefle_')) {
        const id = plantId.replace('trefle_', '');
        const trefleApi = this.apis.find(api => api.name === 'trefle');

        if (trefleApi && trefleApi.key) {
          try {
            const response = await axios.get(
              `${trefleApi.baseUrl}/plants/${id}`,
              {
                params: { token: trefleApi.key },
                timeout: 10000
              }
            );

            const plant = response.data.data;
            const careInstructions = {};

            if (plant.growth) {
              if (plant.growth.light) careInstructions.sunlight = plant.growth.light;
              if (plant.growth.atmospheric_humidity) careInstructions.humidity = plant.growth.atmospheric_humidity;
              if (plant.growth.soil_ph) careInstructions.soil = `pH: ${plant.growth.soil_ph}`;
            }

            return {
              _id: plantId,
              careInstructions: careInstructions || { default: 'See plant details' },
              name: plant.common_name || plant.scientific_name,
              botanicalName: plant.scientific_name || 'Unknown',
              description: plant.observations || 'Plant information from Trefle'
            };
          } catch (error) {
            console.log(`⚠️ Could not fetch Trefle details: ${error.message}`);
          }
        }
      }

      // Return generic if parsing fails
      return {
        _id: plantId,
        careInstructions: { watering: 'Regular', sunlight: 'Indirect' },
        description: 'Plant details not available'
      };
    } catch (error) {
      console.error('❌ Detail fetch error:', error);
      throw error;
    }
  }

  // Search local database (plantData.json)
  searchLocalDatabase(query) {
    if (!this.plantData || this.plantData.length === 0) {
      console.log('⚠️ Plant database not available');
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results = this.plantData.filter(plant =>
      plant.name?.toLowerCase().includes(searchTerm) ||
      plant.commonName?.toLowerCase().includes(searchTerm) ||
      plant.botanicalName?.toLowerCase().includes(searchTerm) ||
      plant.about?.toLowerCase().includes(searchTerm) ||
      plant.care_instruction?.toLowerCase().includes(searchTerm)
    ).slice(0, 10).map(plant => ({
      _id: `local_${plant.plant_id}`,
      name: plant.name || plant.commonName || 'Unknown',
      botanicalName: plant.botanicalName || 'Unknown',
      plant_id: plant.plant_id,
      type: 'Plant',
      image: plant.image_url || '🌿',
      watering: plant.watering || 'Regular watering',
      sunlight: plant.sunlight || 'Bright indirect light',
      soil: plant.soil || 'Well-drained soil',
      climate: plant.climate || 'Temperate',
      about: plant.about || 'Plant information available',
      care_instruction: plant.care_instruction || 'See care instructions for details',
      toxicity: plant.toxicity || 'Not specified',
      source: 'Local Database'
    }));

    return results;
  }
}

// Run cleanup every hour
const service = new PlantApiService();
setInterval(() => service.cleanupCache(), 60 * 60 * 1000);

export default service;