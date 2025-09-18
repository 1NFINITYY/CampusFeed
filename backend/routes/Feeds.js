import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Feed from "../models/Feed.js";

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
      resource_type: isPdf ? "raw" : "auto", // PDFs as raw, others auto
      public_id: file.originalname.split(".")[0],
    };
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
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, description, postedBy } = req.body;

    if (!title || !description || !postedBy) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let fileUrl = req.file ? req.file.path : null;

    // Determine resourceType
    let resourceType = "raw"; // default
    if (req.file) {
      if (req.file.resource_type) resourceType = req.file.resource_type;
      else if (req.file.mimetype.startsWith("image")) resourceType = "image";
      else if (req.file.mimetype.startsWith("video")) resourceType = "video";
      else if (req.file.mimetype === "application/pdf") resourceType = "raw";
    }

    // 🔹 Use correct URL for PDFs (raw delivery)
    if (resourceType === "raw" && fileUrl) {
      fileUrl = fileUrl.replace("/image/upload/", "/raw/upload/");
    }

    const feed = new Feed({
      title,
      description,
      postedBy,
      fileUrl,      // PDF URL now points to raw endpoint
      resourceType, // image | video | raw
    });

    await feed.save();
    res.status(201).json(feed);
  } catch (err) {
    console.error("Error uploading feed:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a feed
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
