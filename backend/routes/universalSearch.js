import express from "express";
import Plant from "../models/Plant.js";

const router = express.Router();

// Define the page routes that exist in the frontend
const pageRoutes = [
  { title: "Home", path: "/", category: "Page" },
  { title: "Plant Database", path: "/plantdatabase", category: "Page" },
  { title: "Plant Gallery", path: "/gallery", category: "Page" },
  { title: "Calendar", path: "/calendar", category: "Page" },
  { title: "Guides", path: "/guides", category: "Page" },
  { title: "Profile", path: "/profile", category: "Page" },
];

// Content suggestions for guides and tips
const contentSuggestions = [
  { title: "Plant care", path: "/guides", category: "Guide" },
  { title: "Watering tips", path: "/guides", category: "Guide" },
  { title: "Sunlight guide", path: "/guides", category: "Guide" },
  { title: "Gardening tips", path: "/guides", category: "Guide" },
  { title: "Garden calendar", path: "/calendar", category: "Tool" },
];

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitizeQuery = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>$]/g, "")
    .trim();

// Universal search endpoint - returns diverse results
// GET /api/search?q=query&limit=10
router.get("/", async (req, res, next) => {
  try {
    const rawQuery = sanitizeQuery(req.query.q ?? "");
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);

    if (!rawQuery) {
      // Return popular plants and page suggestions
      const popularPlants = await Plant.find()
        .sort({ searchCount: -1 })
        .limit(Math.ceil(limit / 2))
        .select("name botanicalName imageUrl tags");

      return res.json({
        meta: { total: popularPlants.length },
        results: [
          ...pageRoutes.slice(0, 2),
          ...popularPlants.map((p) => ({
            id: p._id,
            title: p.name,
            subtitle: p.botanicalName,
            path: `/plantdatabase?search=${encodeURIComponent(p.name)}`,
            category: "Plant",
            image: p.imageUrl,
          })),
        ],
      });
    }

    // Build search regex
    const regex = new RegExp(escapeRegex(rawQuery), "i");

    // Search plants
    const plantsPromise = Plant.find({
      $or: [
        { name: { $regex: regex } },
        { botanicalName: { $regex: regex } },
        { tags: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    })
      .limit(limit)
      .select("_id name botanicalName imageUrl tags");

    // Search in pages and content
    const filteredPages = [
      ...pageRoutes.filter((page) =>
        page.title.toLowerCase().includes(rawQuery.toLowerCase())
      ),
      ...contentSuggestions.filter((content) =>
        content.title.toLowerCase().includes(rawQuery.toLowerCase())
      ),
    ].slice(0, 3);

    const [plants] = await Promise.all([plantsPromise]);

    // Combine and format results
    const plantResults = plants.map((p) => ({
      id: p._id,
      title: p.name,
      subtitle: p.botanicalName || p.tags?.[0],
      path: `/plantdatabase?search=${encodeURIComponent(p.name)}`,
      category: "Plant",
      image: p.imageUrl,
    }));

    const pageResults = filteredPages.map((page) => ({
      title: page.title,
      path: page.path,
      category: page.category,
    }));

    // Interleave results (pages first, then plants)
    const allResults = [...pageResults, ...plantResults].slice(0, limit);

    // Update search count for plants if searched
    if (plants.length > 0) {
      const ids = plants.map((p) => p._id);
      Plant.updateMany(
        { _id: { $in: ids } },
        {
          $inc: { searchCount: 1 },
          $set: { lastSearchedAt: new Date() },
        }
      ).exec();
    }

    res.json({
      meta: { total: allResults.length, query: rawQuery },
      results: allResults,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
