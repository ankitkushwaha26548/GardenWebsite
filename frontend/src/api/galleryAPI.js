const API_ROOT = import.meta.env.VITE_API_BASE_URL || "https://leaflinebackend.onrender.com/api";
const API_BASE = `${API_ROOT}/gallery`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const galleryAPI = {
  // Get all gallery posts
   getAllPosts: async (page = 1, limit = 9) => {
    try {
      const response = await fetch(`${API_BASE}/?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch posts (${response.status})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching gallery posts:", error);
      throw error;
    }
  },

  // Get user's gallery posts
  getUserPosts: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch user posts");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  },

  // Add new gallery post
  addPost: async (postData) => {
    try {
      const response = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add post (${response.status})`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding post:", error);
      throw error;
    }
  },

  // Like/Unlike a post
  toggleLike: async (postId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/like`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ postId, userId }),
      });
      if (!response.ok) throw new Error("Failed to toggle like");
      return await response.json();
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },

  // Add comment
  addComment: async (postId, userId, userName, text) => {
    try {
      const response = await fetch(`${API_BASE}/comment`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ postId, userId, userName, text }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return await response.json();
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Update gallery post
  updatePost: async (postId, userId, title, description) => {
    try {
      const response = await fetch(`${API_BASE}/${postId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, title, description }),
      });
      if (!response.ok) throw new Error("Failed to update post");
      return await response.json();
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  // Delete gallery post
  deletePost: async (postId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/${postId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return await response.json();
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },
};

export default galleryAPI;
