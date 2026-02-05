<<<<<<< HEAD
const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
const API_BASE = `${API_ROOT}/user-plants`
=======
const API_ROOT = import.meta.env.VITE_API_BASE_URL || "https://leaflinebackend.onrender.com/api";
const API_BASE = `${API_ROOT}/user-plants`;
>>>>>>> 36dc283d0568dbf151c34e6c9ec536a3ca7f4bf6

export async function fetchPlants(token) {
  const res = await fetch(`${API_BASE}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createPlant(token, plant) {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(plant)
  });
  return res.json();
}

export async function updatePlant(token, id, body) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function deletePlant(token, id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
