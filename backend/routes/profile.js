import express from "express";
import User from "../models/User.js";
import Feed from "../models/Feed.js";
import LostItem from "../models/LostItem.js";
import { auth } from "../middleware/auth.js";
import cloudinary from "cloudinary";
import multer from "multer";

const router = express.Router();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get profile data
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch feeds with comments populated
    const feeds = await Feed.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("postedBy", "username") // optional: if you want postedBy username
      .populate({
        path: "comments.commentedBy",
        select: "username", // only get the username
      });

    const lostItems = await LostItem.find({ postedBy: req.user.id }).sort({ createdAt: -1 });

    res.json({ user, feeds, lostItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Upload profile picture
router.post("/picture", auth, upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload_stream(
      { folder: "profile_pics", resource_type: "image" },
      async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });

        // Update user's profile picture
        user.profilePic = result.secure_url;
        await user.save();

        res.status(200).json({ profilePic: user.profilePic });
      }
    );

    result.end(req.file.buffer); // send buffer to Cloudinary
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
