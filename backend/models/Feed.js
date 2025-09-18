import mongoose from "mongoose";

const FeedSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    postedBy: { type: String, required: true },
    fileUrl: { type: String }, // Cloudinary URL
    resourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feed", FeedSchema);
