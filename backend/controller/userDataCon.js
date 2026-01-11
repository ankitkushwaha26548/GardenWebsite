import UserData from "../models/userDB.js";

// SAVE USER DATA ON LOGIN
export const saveUserData = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    let userData = await UserData.findOne({ userId });

    if (userData) {
      // Update last login
      userData.lastLogin = new Date();
      await userData.save();
    } else {
      // Create new user data record
      userData = new UserData({
        userId,
        lastLogin: new Date()
      });
      await userData.save();
    }

    res.json({ message: "User data saved", userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER DATA
export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    const userData = await UserData.findOne({ userId }).populate("userId", "name email");

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
