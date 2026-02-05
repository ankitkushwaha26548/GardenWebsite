const API_ROOT = import.meta.env.VITE_API_BASE_URL || "https://leaflinebackend.onrender.com/api";
const API_BASE = `${API_ROOT}/profile`;
const USER_API_BASE = `${API_ROOT}/users`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const profileAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // If profile doesn't exist, return empty profile object
      if (response.status === 404) {
        return {
          bio: '',
          location: '',
          phone: '',
          gardenType: 'Outdoor',
          experience: 'Beginner',
          avatar: ''
        };
      }
      throw new Error("Failed to fetch profile");
    }
    return response.json();
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const error = await 
      response.json().catch(() => ({})); // Handle case where response is not JSON
      throw new Error(error.message || error.error || "Failed to update profile");
    }
    const result = await response.json();
    return result.profile || result;
  },

  // Get user stats (totalPlants, totalPosts, totalLikes, memberSince)
  getUserStats: async (userId) => {
    const response = await fetch(`${API_BASE}/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // Return default stats if not found
      if (response.status === 404) {
        return {
          totalPlants: 0,
          totalPosts: 0,
          totalLikes: 0,
          memberSince: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        };
      }
      throw new Error("Failed to fetch user stats");
    }
    return response.json();
  },

  // Get profile by user ID
  getProfileByUserId: async (userId) => {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  // Upload avatar (accepts base64 string)
  uploadAvatar: async (avatarData) => {
    const response = await fetch(`${API_BASE}/avatar`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ avatar: avatarData }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to upload avatar");
    }
    const result = await response.json();
    return result.profile || result;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${USER_API_BASE}/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to change password");
    }
    return response.json();
  },
};

export default profileAPI;
