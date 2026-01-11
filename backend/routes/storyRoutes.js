import express from "express";
import Story from "../models/Story.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all stories with pagination
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };

    if (search) {
      query.text = { $regex: search, $options: "i" };
    }

    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-comments");

    const total = await Story.countDocuments(query);

    res.json({
      success: true,
      data: stories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total
      }
    });
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching stories",
      error: err.message 
    });
  }
});

// Get single story by ID
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'name email profileImage');

    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: "Story not found" 
      });
    }

    res.json({ success: true, data: story });
  } catch (err) {
    console.error("Error fetching story:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching story",
      error: err.message 
    });
  }
});

// Create new story
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, image } = req.body;
    console.log("📖 Story POST received:", { textLen: text?.length, imagePresent: !!image, user: req.user.name });
    
    // Validation
    if (!text || text.trim() === "") {
      console.warn("❌ Story validation failed: Text required");
      return res.status(400).json({ 
        success: false,
        message: "Story text is required" 
      });
    }

    if (text.trim().length < 10) {
      console.warn("❌ Story validation failed: Text too short", { len: text.trim().length });
      return res.status(400).json({ 
        success: false,
        message: "Story must be at least 10 characters long" 
      });
    }
    
    const story = new Story({
      userId: req.user.id,
      userName: req.user.name || req.user.email || "Anonymous",
      userEmail: req.user.email,
      userProfileImage: req.user.profileImage || null,
      text: text.trim(),
      image: image || null,
      isPublished: true
    });
    
    await story.save();
    await story.populate('userId', 'name email profileImage');

    res.status(201).json({ 
      success: true,
      message: "Story created successfully",
      data: story 
    });
  } catch (err) {
    console.error("Error creating story:", err);
    res.status(500).json({ 
      success: false,
      message: "Error creating story",
      error: err.message 
    });
  }
});

// Update story
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: "Story not found" 
      });
    }

    // Check authorization
    if (story.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this story" 
      });
    }

    const { text, image } = req.body;

    if (text) story.text = text.trim();
    if (image) story.image = image;

    await story.save();
    await story.populate('userId', 'name email profileImage');

    res.json({ 
      success: true,
      message: "Story updated successfully",
      data: story 
    });
  } catch (err) {
    console.error("Error updating story:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating story",
      error: err.message 
    });
  }
});

// Like/Unlike Story
router.put("/like/:id", authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: "Story not found" 
      });
    }
    
    if (!story.likedBy) {
      story.likedBy = [];
    }
    
    const userLikedIndex = story.likedBy.findIndex(id => id.toString() === req.user.id);
    
    if (userLikedIndex > -1) {
      story.likedBy.splice(userLikedIndex, 1);
      story.likes = Math.max(0, story.likes - 1);
    } else {
      story.likedBy.push(req.user.id);
      story.likes++;
    }
    
    await story.save();
    
    res.json({ 
      success: true,
      message: "Story like updated",
      data: story 
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

// Add comment to story
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Comment text is required" 
      });
    }

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: "Story not found" 
      });
    }

    story.comments.push({
      userId: req.user.id,
      userName: req.user.name || req.user.email || "Anonymous",
      text: text.trim()
    });

    await story.save();

    res.status(201).json({ 
      success: true,
      message: "Comment added successfully",
      data: story.comments[story.comments.length - 1] 
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
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: "Story not found" 
      });
    }

    const comment = story.comments.id(req.params.commentId);

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

    story.comments.id(req.params.commentId).deleteOne();
    await story.save();

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

// Delete Story
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ 
        success: false,
        message: "Story not found" 
      });
    }
    
    if (story.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this story" 
      });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: "Story deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting story:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting story",
      error: err.message 
    });
  }
});

// Get user's stories
router.get("/user/:userId", async (req, res) => {
  try {
    const stories = await Story.find({ 
      userId: req.params.userId,
      isPublished: true 
    })
    .sort({ createdAt: -1 })
    .select("-comments");

    res.json({ 
      success: true,
      data: stories 
    });
  } catch (err) {
    console.error("Error fetching user stories:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user stories",
      error: err.message 
    });
  }
});

export default router;
