import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || import.meta.env.REN_URL;
const API_BASE = `${API_ROOT}/calendar`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const calendarAPI = {
  getMonthSchedules: async (userId, year, month) => {
    if (!userId) return [];
    const res = await axios.get(`${API_BASE}/month/${userId}`, {
      params: { year, month },
      headers: authHeaders(),
    });
    return res.data || [];
  },

  createSchedule: async (data) => {
    const res = await axios.post(`${API_BASE}/create`, data, {
      headers: authHeaders(),
    });
    return res.data;
  },

  updateSchedule: async (scheduleId, data) => {
    const res = await axios.put(
      `${API_BASE}/${scheduleId}`,
      data,
      { headers: authHeaders() }
    );
    return res.data;
  },

  markCompleted: async (scheduleId, userId, completed) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/${scheduleId}/complete`,
        { completed },
        { 
          headers: {
            ...authHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!res.data) {
        throw new Error("No data received from server");
      }
      
      return res.data;
    } catch (error) {
      console.error("Error marking completed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Provide more specific error messages
      if (error.response) {
        // Server responded with error status
        const errorMsg = error.response.data?.error || 
                        error.response.data?.message || 
                        `Server error: ${error.response.status} ${error.response.statusText}`;
        throw new Error(errorMsg);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error("Network error: Could not connect to server. Please check your connection.");
      } else {
        // Something else happened
        throw new Error(error.message || "An unexpected error occurred");
      }
    }
  },

  deleteSchedule: async (scheduleId, userId) => {
    const res = await axios.delete(
      `${API_BASE}/${scheduleId}`,
      {
        data: { userId },
        headers: authHeaders(),
      }
    );
    return res.data;
  },
};

export default calendarAPI;
