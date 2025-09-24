// middleware.js
import express from "express";
import cors from "cors";

export const applyMiddleware = (app) => {
  const allowedOrigins = [
    "http://localhost:5173", // ✅ local dev (Vite)
    "http://localhost:3000", // ✅ local dev (CRA)
    "https://campus-feed-nine.vercel.app", // ✅ old Vercel deployment
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

  app.use(express.json());
};
