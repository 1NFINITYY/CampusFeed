// routes/lostItems.js
import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // 👈 your cloudinary config file
import LostItem from "../models/LostItem.js";

const router = express.Router();

// ✅ Use Cloudinary storage instead of local disk
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lost_items", // all images go to Cloudinary folder "lost_items"
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
    const imageUrl = req.file ? req.file.path : null; // 👈 Cloudinary gives URL in `req.file.path`

    if (!title || !description || !postedBy || !contactNo) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const item = new LostItem({ title, description, postedBy, contactNo, imageUrl });
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

// DELETE a lost item
router.delete("/:id", async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // ❌ No need to delete from local folder, but we *can* remove from Cloudinary:
    if (item.imageUrl) {
      // Extract public_id from the URL
      const publicId = item.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`lost_items/${publicId}`);
    }

    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
