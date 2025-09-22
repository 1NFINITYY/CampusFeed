import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // Cloudinary config
import LostItem from "../models/LostItem.js";
import { auth } from "../middleware/auth.js"; // auth middleware

const router = express.Router();

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lost_items",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// GET all lost items with postedBy username
router.get("/", async (req, res) => {
  try {
    const items = await LostItem.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "username"); // populate username from User
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new lost item (protected)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, contactNo } = req.body;
    if (!title || !description || !contactNo) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const imageUrl = req.file ? req.file.path : null;
    const cloudinaryPublicId = req.file ? req.file.filename : null;

    const item = new LostItem({
      title,
      description,
      contactNo,
      postedBy: req.user.id, // 👈 take ID from auth middleware
      imageUrl,
      cloudinaryPublicId,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark as found
router.patch("/:id/found", auth, async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { status: "found" },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a lost item and remove Cloudinary file
router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Only allow owner to delete
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (item.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(`lost_items/${item.cloudinaryPublicId}`, {
          resource_type: "image",
        });
      } catch {}
    }

    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item and Cloudinary file deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
