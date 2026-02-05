import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import plantRoutes from "./routes/plants.js";
import userRoutes from "./routes/userRout.js";
import profileRoutes from "./routes/profileRoutes.js";
import userDataRoutes from "./routes/userDataRoutes.js";
import universalSearchRoutes from "./routes/universalSearch.js";
import plantDatabaseRoutes from './routes/plantDatabase.js';
import galleryRoutes from './routes/galleryRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

dotenv.config();

const app = express();

// CORS configuration - allow all origins for Replit environment
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting - Apply only to auth endpoints, not to general API
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts, please try again later.",
  skip: (req, res) => {
    // Only apply to auth routes
    return !req.path.includes('/login') && !req.path.includes('/signup');
  }
});

// Apply auth limiter only to user routes
app.use("/api/users", authLimiter);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error(" Missing MONGO_URI in .env file");
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
});


// Routes
app.use("/api/users", userRoutes);
app.use("/api/user-plants", plantRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user-data", userDataRoutes);
app.use("/api/search", universalSearchRoutes);
app.use("/api/plant-database", plantDatabaseRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/stories", storyRoutes);

// Health check endpoint
app.get("/", (req, res) => res.json({ 
  message: "🌿 Plant API is running",
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
}));

// API status endpoint
app.get("/api/status", (req, res) => res.json({
  status: "OK",
  database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error.message);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: "Invalid JSON in request body"
    });
  }
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: "CORS policy blocked this request",
      message: "Origin not allowed"
    });
  }
  
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
