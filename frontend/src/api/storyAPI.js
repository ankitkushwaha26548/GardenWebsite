const API_ROOT = import.meta.env.VITE_API_BASE_URL || import.meta.env.REN_URL;
const API_BASE = `${API_ROOT}/stories`;

export async function getStories(page = 1, limit = 10, search = "") {
  try {
    const params = new URLSearchParams({ page, limit, ...(search && { search }) });
    const res = await fetch(`${API_BASE}/stories?${params}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

export async function createStory(data, token) {
  console.log("📖 Sending story data:", { textLen: data.text?.length, image: data.image ? "present" : "null" });
  const res = await fetch(`${API_BASE}/stories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  console.log("📨 Story response status:", res.status, "message:", json.message);
  if (!res.ok) throw new Error(json.message);
  return json.data;
}

export async function likeStory(id, token) {
  const res = await fetch(`${API_BASE}/stories/like/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return json.data;
}

export async function deleteStory(id, token) {
  const res = await fetch(`${API_BASE}/stories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return json.data;
}
