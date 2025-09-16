import express from "express";
import multer from "multer";
import LostItem from "../models/LostItem.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "." + file.originalname.split(".").pop());
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
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

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

    // Delete image file if exists
    if (item.imageUrl) {
      const imagePath = path.join("uploads", path.basename(item.imageUrl));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
