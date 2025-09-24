import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import LostItem from "../models/LostItem.js";
import { auth } from "../middleware/auth.js";

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

// GET all lost items with postedBy username + phone
router.get("/", async (req, res) => {

  try {
    const items = await LostItem.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "username phone");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new lost item (protected)
router.post("/", auth, upload.single("image"), async (req, res) => {

  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const imageUrl = req.file ? req.file.path : null;
    const cloudinaryPublicId = req.file ? req.file.filename : null;

    const item = new LostItem({
      title,
      description,
      postedBy: req.user.id,
      imageUrl,
      cloudinaryPublicId,
    });

    const saved = await item.save();

    res.status(201).json(saved);
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
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {

    res.status(500).json({ error: err.message });
  }
});

// DELETE lost item
router.delete("/:id", auth, async (req, res) => {
  
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (item.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(`lost_items/${item.cloudinaryPublicId}`, {
          resource_type: "image",
        });
      } catch (err) {
        return res.status(err.status || 500).json({ error: err.message || "Cloudinary deletion failed" });
      }
    }

    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {

    res.status(500).json({ error: err.message });
  }
});

export default router;
