const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class PlantService {
  async searchPlants(query) {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/plant-database/search?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('🌿 Plant service error:', error);
      throw error;
    }
  }

  async getPlantDetails(plantId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/plant-database/${encodeURIComponent(plantId)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch plant details');
      }
    } catch (error) {
      console.error('🌿 Plant service error:', error);
      throw error;
    }
  }

  async checkApiStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plant-database/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Cannot connect to server'
      };
    }
  }
}

export default new PlantService();