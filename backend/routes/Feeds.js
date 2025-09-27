import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Feed from "../models/Feed.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: "campus-feed",
      resource_type: isPdf ? "raw" : "auto",
      public_id: `${file.originalname.split(".")[0]}-${Date.now()}`,
    };
  },
});

const upload = multer({ storage });

// GET all feeds (populate postedBy + comments.commentedBy)
router.get("/", async (req, res) => {
  try {
    const feeds = await Feed.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "username")
      .populate("comments.commentedBy", "username");
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a feed
router.post("/", auth, upload.array("files", 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description are required" });

    const files = req.files.map((file) => {
      let type = "raw";
      if (file.mimetype.startsWith("image")) type = "image";
      else if (file.mimetype.startsWith("video")) type = "video";

      let url = file.path;
      if (type === "raw") url = url.replace("/image/upload/", "/raw/upload/");

      return { url, type, cloudinaryPublicId: file.filename };
    });

    const feed = new Feed({
      title,
      description,
      postedBy: req.user.id,
      files,
    });

    await feed.save();
    res.status(201).json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a feed
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const feed = await Feed.findById(id);
    if (!feed) return res.status(404).json({ message: "Feed not found" });
    if (feed.postedBy.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    if (feed.files?.length > 0) {
      for (let file of feed.files) {
        if (!file.cloudinaryPublicId) continue;
        try {
          await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
            resource_type: file.type === "raw" ? "raw" : file.type === "video" ? "video" : "image",
          });
        } catch {}
      }
    }

    await Feed.findByIdAndDelete(id);
    res.status(200).json({ message: "Feed deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LIKE a feed
router.post("/:id/like", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ message: "Feed not found" });

    const userId = req.user.id;
    if (feed.likes.includes(userId)) return res.status(400).json({ message: "Already liked" });

    feed.likes.push(userId);
    await feed.save();
    res.json({ likes: feed.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UNLIKE a feed
router.post("/:id/unlike", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ message: "Feed not found" });

    const userId = req.user.id;
    feed.likes = feed.likes.filter((id) => id.toString() !== userId);
    await feed.save();
    res.json({ likes: feed.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD a comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ message: "Feed not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    feed.comments.push({ text, commentedBy: req.user.id });
    await feed.save();

    // Populate commentedBy username
    await feed.populate("comments.commentedBy", "username");

    res.json(feed.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
