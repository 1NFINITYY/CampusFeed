// middleware.js
import express from "express";
import cors from "cors";

export const applyMiddleware = (app) => {
  const allowedOrigins = [
    "http://localhost:5173", // ✅ local dev (Vite)
    "https://campus-feed-infinity.vercel.app", // ✅ new Vercel deployment
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin (like curl or Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true, // if using cookies or auth headers
    })
  );

  // 10mb limit needed for base64 image payloads sent to Gemini Vision API
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
};
