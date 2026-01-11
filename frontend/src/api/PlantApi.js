export const apiBase = "http://localhost:5000/api";

export async function fetchPlants(token) {
  const res = await fetch(`${apiBase}/user-plants`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createPlant(token, plant) {
  const res = await fetch(`${apiBase}/user-plants`, {
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
  const res = await fetch(`${apiBase}/user-plants/${id}`, {
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
  const res = await fetch(`${apiBase}/user-plants/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
