import express from "express";
import User from "../models/User.js";
import Feed from "../models/Feed.js";
import LostItem from "../models/LostItem.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Get profile data
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // ✅ use req.user.id
    if (!user) return res.status(404).json({ error: "User not found" });

    const feeds = await Feed.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    const lostItems = await LostItem.find({ postedBy: req.user.id }).sort({ createdAt: -1 });

    res.json({ user, feeds, lostItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
