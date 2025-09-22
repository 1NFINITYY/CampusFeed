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
      public_id: file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage });

// GET all feeds (populate username)
router.get("/", async (req, res) => {
  try {
    const feeds = await Feed.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "username"); // only username
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a feed (protected)
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    let fileUrl = req.file ? req.file.path : null;

    // Determine resourceType
    let resourceType = "raw";
    if (req.file) {
      if (req.file.resource_type) resourceType = req.file.resource_type;
      else if (req.file.mimetype.startsWith("image")) resourceType = "image";
      else if (req.file.mimetype.startsWith("video")) resourceType = "video";
      else if (req.file.mimetype === "application/pdf") resourceType = "raw";
    }

    if (resourceType === "raw" && fileUrl) {
      fileUrl = fileUrl.replace("/image/upload/", "/raw/upload/");
    }

    const feed = new Feed({
      title,
      description,
      postedBy: req.user.id, // automatically from JWT
      fileUrl,
      resourceType,
      cloudinaryPublicId: req.file?.filename,
    });

    await feed.save();
    res.status(201).json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a feed (protected)
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const feed = await Feed.findById(id);

    if (!feed) return res.status(404).json({ message: "Feed not found" });

    // Check ownership
    if (feed.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this feed" });
    }

    if (feed.cloudinaryPublicId) {
      const publicId = `campus-feed/${feed.cloudinaryPublicId}`;
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type:
            feed.resourceType === "raw"
              ? "raw"
              : feed.resourceType === "video"
              ? "video"
              : "image",
        });
      } catch {}
    }

    await Feed.findByIdAndDelete(id);
    res.status(200).json({ message: "Feed deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
