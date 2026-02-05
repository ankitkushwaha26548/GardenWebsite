const API_ROOT = import.meta.env.VITE_API_BASE_URL || "https://leaflinebackend.onrender.com/api";

export async function getBlogs(page = 1, limit = 10, category = "all", search = "") {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...(category !== "all" && { category }),
      ...(search && { search })
    });

    const res = await fetch(`${API_ROOT}/blogs?${params}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export async function getBlogById(id) {
  const res = await fetch(`${API_ROOT}/blogs/${id}`);
  const json = await res.json();
  return json.data;
}

export async function createBlog(data, token) {
  console.log("📝 Sending blog data:", { title: data.title, summary: data.summary, contentLen: data.content?.length, image: data.image ? "present" : "null" });
  const res = await fetch(`${API_ROOT}/blogs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  console.log("📨 Blog response status:", res.status, "message:", json.message);
  if (!res.ok) throw new Error(json.message);
  return json.data;
}

export async function likeBlog(id, token) {
  const res = await fetch(`${API_ROOT}/blogs/like/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return json.data;
}

export async function deleteBlog(id, token) {
  const res = await fetch(`${API_ROOT}/blogs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return json.data;
}
