import Gallery from "../models/Gallery.js";

// Get all gallery posts

export const getAllGallery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9; // Default to 9 posts per page
    const skip = (page - 1) * limit;

    const gallery = await Gallery.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gallery.countDocuments();

    console.log(`✓ Fetched ${gallery.length} gallery posts (Page ${page})`);
    res.json({
      posts: gallery,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (err) {
    console.error("❌ Error fetching gallery:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get user's gallery posts
export const getUserGallery = async (req, res) => {
  try {
    const { userId } = req.params;
    const gallery = await Gallery.find({ userId })
      .sort({ createdAt: -1 });

    console.log(`✓ Fetched ${gallery.length} posts for user ${userId}`);
    res.json(gallery);
  } catch (err) {
    console.error("❌ Error fetching user gallery:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add new gallery post
export const addGalleryPost = async (req, res) => {
  try {
    const { userId, userName, userEmail, title, description, imageUrl } = req.body;

    console.log("Adding gallery post with data:", {
      userId: userId ? "✓" : "✗",
      userName,
      userEmail,
      title,
      imageUrl: imageUrl ? `✓ (${imageUrl.length} chars)` : "✗",
    });

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const newPost = new Gallery({
      userId,
      userName: userName || "Anonymous",
      userEmail: userEmail || "user@example.com",
      title: title || "Garden Photo",
      description: description || "",
      imageUrl,
      likes: [],
      likeCount: 0,
    });

    const saved = await newPost.save();
    console.log("Gallery post saved successfully:", saved._id);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error adding gallery post:", err);
    res.status(500).json({ error: err.message });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const post = await Gallery.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
  const userIdStr = userId.toString();
    const isAlreadyLiked = post.likes.some(id => id.toString() === userIdStr);

    if (isAlreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      // Like
      post.likes.push(userId);
    }
    
    post.likeCount = post.likes.length;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { postId, userId, userName, text } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const post = await Gallery.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({
      userId,
      userName: userName || "Anonymous",
      text,
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete gallery post
export const deleteGalleryPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Gallery.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only owner can delete
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Gallery.findByIdAndDelete(postId);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update gallery post
export const updateGalleryPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, title, description } = req.body;

    const post = await Gallery.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only owner can edit
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    post.title = title || post.title;
    post.description = description || post.description;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
