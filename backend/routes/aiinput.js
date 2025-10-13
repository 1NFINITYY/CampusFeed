import express from "express";
import fetch from "node-fetch";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/metadata", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const prompt = `
You are a smart AI assistant. Analyze the following user text and return ONLY a JSON object with fields:
{
  "title": "short suitable title",
  "description": "short clean version of the text",
  "type": "feed" or "lostitem"
}

Rules:
- If the text contains words like "lost", "found", "wallet", "phone", "bag", classify it as "lostitem"
- Otherwise classify as "feed"

Text: """${text}"""
`;

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gemini API error",
        details: data.error?.message || "Unknown error",
      });
    }

    let aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    aiText = aiText.replace(/```json|```/g, "").trim();

    let metadata;
    try {
      metadata = JSON.parse(aiText);
    } catch (err) {
      return res.status(500).json({
        error: "Gemini returned invalid JSON",
        aiText,
      });
    }

    res.json({ metadata });
  } catch (err) {
    res.status(500).json({
      error: "Failed to generate metadata",
      details: err.message,
    });
  }
});

export default router;
