import express from "express";
import multer from "multer";
import path from "path";
import Feed from "../models/Feed.js";

const router = express.Router();

// Multer setup for feed images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET all feeds
router.get("/", async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a feed
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const feed = new Feed({ title, description, imageUrl });
    await feed.save();

    res.status(201).json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//deletes a feed
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
