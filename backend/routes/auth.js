import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET; // ⚠️ keep secret in env

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Check existing user by email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email or phone already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      profilePic: "", // 👈 default empty string for now
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic || "",
      },
      SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Send token and userId together
    res.json({
      token,
      userId: user._id,
      username: user.username,
      profilePic: user.profilePic || "",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
