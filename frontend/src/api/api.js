const API_ROOT = import.meta.env.VITE_API_BASE_URL || "https://leaflinebackend.onrender.com/api";
const PLANTS_ENDPOINT = `${API_ROOT}/plants`;
const SEARCH_ENDPOINT = `${API_ROOT}/search`;
const USER_PLANTS_ENDPOINT = `${API_ROOT}/user-plants`;

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message = error?.error || error?.message || "Request failed";
    throw new Error(message);
  }
  return res.json();
};

// Get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ==================== USER PLANTS ====================

// GET USER PLANTS
export const getUserPlants = async (userId) => {
  // GET current user's plants; unwrap { success, data, count }
  const response = await fetch(`${USER_PLANTS_ENDPOINT}/user`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse(response);
  return Array.isArray(json) ? json : (json?.data || []);
};

// ADD PLANT - Fetches care details from Perenual API
export const addPlant = async (plantData) => {
  const response = await fetch(USER_PLANTS_ENDPOINT, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(plantData),
  });
  return handleResponse(response);
};

// DELETE PLANT
export const deletePlant = async (plantId) => {
  const response = await fetch(`${USER_PLANTS_ENDPOINT}/${plantId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==================== SEARCH & DISCOVERY ====================

// Universal search - searches across plants, pages, and content
export const universalSearch = async ({
  q = "",
  limit = 8,
  signal
} = {}) => {
  const params = new URLSearchParams();
  if (q !== undefined) params.set("q", q);
  params.set("limit", limit);
  const response = await fetch(
    `${SEARCH_ENDPOINT}?${params.toString()}`,
    { signal }
  );
  return handleResponse(response);
};

export const searchPlants = async ({
  q = "",
  page = 1,
  limit = 8,
  signal
} = {}) => {
  const params = new URLSearchParams();
  if (q !== undefined) params.set("q", q);
  params.set("page", page);
  params.set("limit", limit);
  const response = await fetch(
    `${PLANTS_ENDPOINT}/search?${params.toString()}`,
    { signal }
  );
  return handleResponse(response);
};

export const fetchPlant = async (id) => {
  const response = await fetch(`${PLANTS_ENDPOINT}/${id}`);
  return handleResponse(response);
};

export const fetchPlantHighlights = async () => {
  const response = await fetch(`${PLANTS_ENDPOINT}/highlights`);
  return handleResponse(response);
};

//plantDatabase fetch
import axios from 'axios';

export async function fetchPlantDatabase(query = '', page = 1) {
  const q = encodeURIComponent(query);
  const res = await axios.get(`/api/plants`, {
    params: {
      search: q,
      page: page
    }
  });
  return res.data;
}

export const fetchPlantCollection = async ({
  page = 1,
  limit = 12,
  tag
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (tag) params.set("tag", tag);
  const response = await fetch(`${PLANTS_ENDPOINT}?${params.toString()}`);
  return handleResponse(response);
};
