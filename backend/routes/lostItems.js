import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // your Cloudinary config file
import LostItem from "../models/LostItem.js";

const router = express.Router();

// ✅ Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lost_items",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// GET all lost items
router.get("/", async (req, res) => {
  try {
    const items = await LostItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new lost item
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, postedBy, contactNo } = req.body;
    if (!title || !description || !postedBy || !contactNo) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const imageUrl = req.file ? req.file.path : null;
    const cloudinaryPublicId = req.file ? req.file.filename : null; // Save public_id for deletion

    const item = new LostItem({
      title,
      description,
      postedBy,
      contactNo,
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
router.patch("/:id/found", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Delete from Cloudinary if public_id exists
    if (item.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(`lost_items/${item.cloudinaryPublicId}`, {
          resource_type: "image",
        });
      } catch (cloudErr) {
        console.error("Cloudinary deletion error:", cloudErr);
      }
    }

    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item and Cloudinary file deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
