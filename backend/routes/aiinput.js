import express from "express";
import fetch from "node-fetch";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("[FATAL] GEMINI_API_KEY is not set in environment variables.");
}

// POST /api/ai/metadata
// Accepts: { imageBase64: string, mimeType: string }
// Returns: { metadata: { title, description, type } }
router.post("/metadata", auth, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured on server" });
    }

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "imageBase64 and mimeType are required" });
    }

    const prompt = `You are helping students post content on a campus social app. Analyze this image and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

Return this exact structure:
{
  "title": "short, catchy title for the campus post (do NOT say 'screenshot', 'image', or 'photo')",
  "description": "1-2 sentence description written as a campus post caption — describe what is happening or what the item/content is about, NOT that it is an image or screenshot",
  "type": "feed" or "lostitem"
}

Rules for "description":
- Write as if YOU are the student posting this. Describe the subject directly.
- NEVER start with "A screenshot of", "An image of", "A photo of", or similar meta-phrases.
- Example good: "Sample test cases for a competitive programming problem involving ball arrangements."
- Example bad: "A screenshot displaying sample inputs and outputs for a competitive programming problem."

Classification rules for "type":
- "lostitem" → personal item someone might lose or find (e.g. water bottle, phone, wallet, keys, bag, ID card, earphones, charger, umbrella, spectacles, hoodie, clothing)
- "feed" → everything else (campus events, notices, food, selfies, memes, announcements, etc.)

IMPORTANT: Return ONLY the JSON object. No \`\`\`json or \`\`\` wrappers. No extra text.`;

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

    // Retry up to 3 times on 503 (model temporarily overloaded)
    let response, data;
    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        }),
      });

      data = await response.json();

      if (response.status !== 503) break;

      // Wait before retrying: 2s, 4s, 6s
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Gemini API error",
        details: data.error?.message || "Unknown error",
      });
    }

    let aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiText) {
      return res.status(500).json({ error: "Gemini returned an empty response" });
    }

    // Strip any accidental markdown code fences
    aiText = aiText.replace(/```json|```/g, "").trim();

    let metadata;
    try {
      metadata = JSON.parse(aiText);
    } catch {
      return res.status(500).json({ error: "Gemini returned invalid JSON", aiText });
    }

    res.json({ metadata });
  } catch (err) {
    console.error("[AI /metadata] Error:", err.message);
    res.status(500).json({ error: "Failed to generate metadata", details: err.message });
  }
});

export default router;
