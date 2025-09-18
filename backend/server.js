import express from "express"; 
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js"; // ✅ import db
import lostItemsRoutes from "./routes/lostItems.js";
import feedsRoutes from "./routes/Feeds.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/lostitems", lostItemsRoutes);
app.use("/api/feeds", feedsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
