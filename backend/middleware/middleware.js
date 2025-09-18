// middleware.js
import express from "express";
import cors from "cors";

export const applyMiddleware = (app) => {
  // Enable CORS for frontend
  app.use(cors({ origin: "http://localhost:5173" }));

  // Parse JSON request bodies
  app.use(express.json());

  // If you want to serve static files later (optional)
  // app.use("/uploads", express.static("uploads"));
};
