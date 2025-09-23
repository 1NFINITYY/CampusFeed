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
  console.log("[GET] /api/lostitems called");
  try {
    const items = await LostItem.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "username phone");
    res.json(items);
  } catch (err) {
    console.error("[GET] Error fetching lost items:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST new lost item (protected)
router.post("/", auth, upload.single("image"), async (req, res) => {
  console.log("[POST] /api/lostitems called by", req.user.id);
  console.log("[POST] body:", req.body);
  console.log("[POST] file:", !!req.file);

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
    console.log("[POST] Lost item created:", saved._id);
    res.status(201).json(saved);
  } catch (err) {
    console.error("[POST] Error creating lost item:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark as found
router.patch("/:id/found", auth, async (req, res) => {
  console.log(`[PATCH] /api/lostitems/${req.params.id}/found called`);
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { status: "found" },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error(`[PATCH] Error marking item found:`, err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE lost item
router.delete("/:id", auth, async (req, res) => {
  console.log(`[DELETE] /api/lostitems/${req.params.id} called by ${req.user.id}`);
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
        console.error("[DELETE] Cloudinary error:", err);
      }
    }

    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("[DELETE] Error deleting item:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
