import express from "express";
import Blog from "../models/Blog.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all blogs with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-comments");

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total
      }
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching blogs",
      error: err.message 
    });
  }
});

// Get single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'name email profileImage');

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching blog",
      error: err.message 
    });
  }
});

// Create new blog
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, image, category, tags } = req.body;
    console.log("📝 Blog POST received:", { title, summaryLen: summary?.length, contentLen: content?.length, imagePresent: !!image, user: req.user.name });
    
    // Validation
    if (!title || !title.trim()) {
      console.warn("❌ Blog validation failed: Title required");
      return res.status(400).json({ 
        success: false,
        message: "Title is required" 
      });
    }

    if (!summary || !summary.trim()) {
      console.warn("❌ Blog validation failed: Summary required");
      return res.status(400).json({ 
        success: false,
        message: "Summary is required" 
      });
    }

    if (!content || !content.trim()) {
      console.warn("❌ Blog validation failed: Content required");
      return res.status(400).json({ 
        success: false,
        message: "Content is required" 
      });
    }

    if (content.trim().length < 10) {
      console.warn("❌ Blog validation failed: Content too short", { len: content.trim().length });
      return res.status(400).json({ 
        success: false,
        message: "Content must be at least 10 characters long" 
      });
    }

    const blog = new Blog({
      title: title.trim(),
      author: req.user.name || req.user.email || "Anonymous",
      userId: req.user.id,
      summary: summary.trim(),
      content: content.trim(),
      image: image || null,
      category: category || "Other",
      tags: tags ? tags.map(t => t.trim()).filter(t => t) : [],
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      isPublished: true
    });
    
    await blog.save();
    await blog.populate('userId', 'name email profileImage');

    res.status(201).json({ 
      success: true,
      message: "Blog created successfully",
      data: blog 
    });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ 
      success: false,
      message: "Error creating blog",
      error: err.message 
    });
  }
});

// Update blog
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    // Check authorization
    if (blog.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this blog" 
      });
    }

    const { title, summary, content, image, category, tags } = req.body;

    blog.title = title?.trim() || blog.title;
    blog.summary = summary?.trim() || blog.summary;
    blog.content = content?.trim() || blog.content;
    blog.image = image || blog.image;
    blog.category = category || blog.category;
    blog.tags = tags ? tags.map(t => t.trim()).filter(t => t) : blog.tags;

    await blog.save();
    await blog.populate('userId', 'name email profileImage');

    res.json({ 
      success: true,
      message: "Blog updated successfully",
      data: blog 
    });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating blog",
      error: err.message 
    });
  }
});

// Like/Unlike Blog
router.put("/like/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }
    
    const userLikedIndex = blog.likedBy.findIndex(id => id.toString() === req.user.id);
    
    if (userLikedIndex > -1) {
      blog.likedBy.splice(userLikedIndex, 1);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      blog.likedBy.push(req.user.id);
      blog.likes++;
    }
    
    await blog.save();
    
    res.json({ 
      success: true,
      message: "Blog like updated",
      data: blog 
    });
  } catch (err) {
    console.error("Error updating likes:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating likes",
      error: err.message 
    });
  }
});

// Add comment to blog
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Comment text is required" 
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    blog.comments.push({
      userId: req.user.id,
      userName: req.user.name || req.user.email || "Anonymous",
      text: text.trim()
    });

    await blog.save();

    res.status(201).json({ 
      success: true,
      message: "Comment added successfully",
      data: blog.comments[blog.comments.length - 1] 
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ 
      success: false,
      message: "Error adding comment",
      error: err.message 
    });
  }
});

// Delete comment
router.delete("/:id/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    const comment = blog.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: "Comment not found" 
      });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this comment" 
      });
    }

    blog.comments.id(req.params.commentId).deleteOne();
    await blog.save();

    res.json({ 
      success: true,
      message: "Comment deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting comment",
      error: err.message 
    });
  }
});

// Delete Blog
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }
    
    if (blog.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this blog" 
      });
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: "Blog deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting blog",
      error: err.message 
    });
  }
});

// Get user's blogs
router.get("/user/:userId", async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      userId: req.params.userId,
      isPublished: true 
    })
    .sort({ createdAt: -1 })
    .select("-comments");

    res.json({ 
      success: true,
      data: blogs 
    });
  } catch (err) {
    console.error("Error fetching user blogs:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user blogs",
      error: err.message 
    });
  }
});

export default router;
