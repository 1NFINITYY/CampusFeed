// config/cloudinary.js
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

console.log("Cloudinary config check:");
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("API secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded ✅" : "Missing ❌");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optional quick debug (remove in production)
if (!process.env.CLOUDINARY_API_KEY) {
  console.warn("⚠️ CLOUDINARY_API_KEY is not set");
}

export default cloudinary;
