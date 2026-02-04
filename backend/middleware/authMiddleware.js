import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token found
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIXED: Attach full user object to request
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      profileImage: decoded.profileImage
    };

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
