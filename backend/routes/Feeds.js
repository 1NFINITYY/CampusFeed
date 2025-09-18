import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Feed from "../models/Feed.js";

const router = express.Router();

// 🔹 Cloudinary config (make sure your .env has CLOUDINARY_* vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Multer Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "campus-feed", // all images will go into this folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }], // optional resize
  },
});

const upload = multer({ storage });

// 🔹 GET all feeds
router.get("/", async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST a feed
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, postedBy } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Cloudinary returns secure URL in file.path

    const feed = new Feed({ title, description, postedBy, imageUrl });
    await feed.save();

    res.status(201).json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE a feed
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFeed = await Feed.findByIdAndDelete(id);

    if (!deletedFeed) {
      return res.status(404).json({ message: "Feed not found" });
    }

    res.status(200).json({ message: "Feed deleted successfully" });
  } catch (err) {
    console.error("Error deleting feed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
