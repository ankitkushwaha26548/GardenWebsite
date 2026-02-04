import UserProfile from "../models/UserProfile.js";
import User from "../models/userDB.js";
import UserPlant from "../models/UserPlant.js";
import Gallery from "../models/Gallery.js";

// CREATE OR UPDATE USER PROFILE
export const saveUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { bio, avatar, phone, location, gardenType, experience, favoriteCategories } = req.body;

    // Check if profile exists
    let profile = await UserProfile.findOne({ userId });

    if (profile) {
      // Update existing profile
      profile.bio = bio || profile.bio;
      profile.avatar = avatar || profile.avatar;
      profile.phone = phone || profile.phone;
      profile.location = location || profile.location;
      profile.gardenType = gardenType || profile.gardenType;
      profile.experience = experience || profile.experience;
      profile.favoriteCategories = favoriteCategories || profile.favoriteCategories;
      profile.updatedAt = new Date();

      await profile.save();
      res.json({ message: "Profile updated successfully", profile });
    } else {
      // Create new profile
      const newProfile = new UserProfile({
        userId,
        bio,
        avatar,
        phone,
        location,
        gardenType,
        experience,
        favoriteCategories
      });

      await newProfile.save();
      res.json({ message: "Profile created successfully", profile: newProfile });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const profile = await UserProfile.findOne({ userId }).populate("userId", "name email");

    if (!profile) {
      // Return empty profile structure instead of 404
      return res.json({
        bio: '',
        avatar: '',
        phone: '',
        location: '',
        gardenType: 'Outdoor',
        experience: 'Beginner',
        favoriteCategories: []
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE LOGIN STATS
export const updateLoginStats = async (req, res) => {
  try {
    const userId = req.userId;

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      // Create profile if doesn't exist
      profile = new UserProfile({ userId });
    }

    profile.lastLogin = new Date();
    profile.loginCount = (profile.loginCount || 0) + 1;
    profile.updatedAt = new Date();

    await profile.save();
    res.json({ message: "Login stats updated", profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER STATS
export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;

    const profile = await UserProfile.findOne({ userId });
    const user = await User.findById(userId);

    if (!user) {
      // If user session is valid but user not found in DB, return 404
      return res.status(404).json({ message: "User not found" });
    }

    // Get counts from different collections
    const totalPlants = await UserPlant.countDocuments({ userId });
    const totalPosts = await Gallery.countDocuments({ userId });
    
    // Get total likes received (sum of likeCount from user's gallery posts)
    const userGalleryPosts = await Gallery.find({ userId });
    const totalLikes = userGalleryPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0);

    // Get member since date from user creation or profile creation
    const memberSince = user?.createdAt || profile?.createdAt || new Date();

    const stats = {
      userName: user?.name,
      userEmail: user?.email,
      totalPlants,
      totalPosts,
      totalLikes,
      memberSince: memberSince.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };

    // Add profile data if it exists
    if (profile) {
      const profileObj = profile.toObject();
      // Ensure we don't overwrite stats with empty profile fields if profile just exists
      stats.bio = profileObj.bio || "";
      stats.avatar = profileObj.avatar || "";
      stats.phone = profileObj.phone || "";
      stats.location = profileObj.location || "";
      stats.gardenType = profileObj.gardenType || "Outdoor";
      stats.experience = profileObj.experience || "Beginner";
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPLOAD AVATAR
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId;
    const { avatar } = req.body; // Expecting base64 string or URL

    if (!avatar) {
      return res.status(400).json({ message: "Avatar image is required" });
    }

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      // Create profile if doesn't exist
      profile = new UserProfile({ userId, avatar });
      await profile.save();
    } else {
      profile.avatar = avatar;
      profile.updatedAt = new Date();
      await profile.save();
    }

    res.json({ message: "Avatar uploaded successfully", profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
