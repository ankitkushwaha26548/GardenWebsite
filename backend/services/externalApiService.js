import axios from 'axios';
import { defaultPlants } from '../data/plantData.js';

class ExternalApiService {
  constructor() {
    this.apis = [
      {
        name: 'perenual',
        baseUrl: 'https://perenual.com/api',
        key: process.env.PERENUAL_KEY,
        search: this.searchPerenual.bind(this),
        priority: 1
      }
    ];
    this.cache = new Map();
  }

  // Search Perenual API
  async searchPerenual(query, apiConfig) {
    try {
      console.log(`🔍 Searching Perenual API for: ${query}`);
      
      const searchResponse = await axios.get(
        `${apiConfig.baseUrl}/species-list`,
        {
          params: {
            key: apiConfig.key,
            q: query,
            page: 1
          },
          timeout: 10000
        }
      );

      if (searchResponse.data.data && searchResponse.data.data.length > 0) {
        const plants = searchResponse.data.data.slice(0, 10).map(plant => ({
          _id: `api_${plant.id}`,
          name: plant.common_name || 'Unknown Plant',
          botanicalName: plant.scientific_name?.[0] || 'Unknown',
          type: this.mapPlantType(plant.type),
          sunlight: this.mapSunlight(plant.sunlight),
          water: this.mapWatering(plant.watering),
          description: plant.description || `Care information for ${plant.common_name}`,
          image: this.getPlantEmoji(plant.common_name),
          about: this.generateAboutText(plant),
          careInstructions: this.generateCareInstructions(plant),
          source: 'perenual_api'
        }));

        return plants;
      }
      
      return [];
    } catch (error) {
      console.log(`❌ Perenual API error: ${error.message}`);
      return [];
    }
  }

  // Main search function with fallback
  async searchPlants(query) {
    // First, try external APIs
    const sortedApis = this.apis
      .filter(api => api.key && api.key !== 'your_key_here')
      .sort((a, b) => a.priority - b.priority);

    for (const api of sortedApis) {
      try {
        const results = await api.search(query, api);
        if (results && results.length > 0) {
          console.log(`✅ Found ${results.length} plants from ${api.name} API`);
          return results;
        }
      } catch (error) {
        console.log(`❌ ${api.name} API failed: ${error.message}`);
        continue;
      }
    }

    // Fallback to local database search
    console.log('🌿 Using local plant database as fallback');
    const localResults = this.searchLocalDatabase(query);
    return localResults;
  }

  // Search local database
  searchLocalDatabase(query) {
    if (!query || query.trim() === '') {
      return defaultPlants;
    }

    const searchTerm = query.toLowerCase().trim();
    const results = defaultPlants.filter(plant =>
      plant.name.toLowerCase().includes(searchTerm) ||
      plant.botanicalName.toLowerCase().includes(searchTerm) ||
      plant.type.toLowerCase().includes(searchTerm) ||
      plant.description.toLowerCase().includes(searchTerm)
    );

    return results.length > 0 ? results : defaultPlants;
  }

  // Get all plants from local database
  getAllPlants() {
    return defaultPlants;
  }

  // Get plant by ID
  getPlantById(id) {
    return defaultPlants.find(plant => plant._id === id) || null;
  }

  // Helper methods
  mapPlantType(type) {
    const typeMap = {
      'succulent': 'Succulent',
      'flowering': 'Flowering',
      'foliage': 'Foliage',
      'vine': 'Vining',
      'tree': 'Tree',
      'shrub': 'Shrub'
    };
    return typeMap[type?.toLowerCase()] || 'Unknown';
  }

  mapSunlight(sunlight) {
    if (!sunlight) return 'Medium Indirect';
    
    if (sunlight.includes('full_sun')) return 'Bright Direct';
    if (sunlight.includes('part_shade')) return 'Medium Indirect';
    if (sunlight.includes('full_shade')) return 'Low Light';
    
    return 'Medium Indirect';
  }

  mapWatering(watering) {
    if (!watering) return 'When soil is dry';
    
    if (watering.includes('frequent')) return 'Weekly';
    if (watering.includes('average')) return 'Every 1-2 weeks';
    if (watering.includes('minimum')) return 'Every 2-3 weeks';
    
    return 'When soil is dry';
  }

  getPlantEmoji(plantName) {
    const emojiMap = {
      'snake': '🌿',
      'lily': '🌸',
      'spider': '🕷️',
      'pothos': '🌱',
      'aloe': '🌵',
      'rubber': '🌳',
      'rose': '🌹',
      'fern': '🍀',
      'cactus': '🌵',
      'palm': '🌴'
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (plantName.toLowerCase().includes(key)) {
        return emoji;
      }
    }
    
    return '🌿';
  }

  generateAboutText(plant) {
    return `${plant.common_name || 'This plant'} is a beautiful addition to any indoor garden. ${plant.description || 'It requires standard care and maintenance to thrive indoors.'}

This species is known for its adaptability and can grow well in various indoor conditions with proper care. Regular monitoring and appropriate watering will help this plant flourish in your home.

With the right conditions, this plant can become a long-lasting and rewarding part of your indoor plant collection.`;
  }

  generateCareInstructions(plant) {
    return {
      light: "Provide appropriate light conditions based on the plant's needs. Most indoor plants prefer bright, indirect sunlight.",
      water: "Water when the top inch of soil feels dry. Adjust watering frequency based on season and environment.",
      soil: "Use well-draining potting mix suitable for the plant type.",
      temperature: "Maintain comfortable room temperatures between 60-75°F (15-24°C).",
      humidity: "Average household humidity is usually sufficient. Some plants may benefit from occasional misting.",
      fertilizer: "Feed with balanced fertilizer during the growing season according to package instructions.",
      propagation: "Propagate through stem cuttings, division, or other appropriate methods.",
      commonProblems: "Watch for signs of overwatering, pests, or insufficient light. Address issues promptly."
    };
  }
}

export default new ExternalApiService();