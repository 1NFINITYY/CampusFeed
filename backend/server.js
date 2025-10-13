// server.js
import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { applyMiddleware } from "./middleware/middleware.js";

import lostItemsRoutes from "./routes/lostItems.js";
import feedsRoutes from "./routes/Feeds.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import aiRoutes from "./routes/aiinput.js";


dotenv.config();

const app = express();

// Apply middleware
applyMiddleware(app);

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/lostitems", lostItemsRoutes);
app.use("/api/feeds", feedsRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/api/ai", aiRoutes);


// Optional: serve static frontend (if you build React later)
// app.use(express.static(path.join(__dirname, "client/build")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
