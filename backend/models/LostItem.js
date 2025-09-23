import mongoose from "mongoose";

const lostItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    status: { type: String, enum: ["lost", "found"], default: "lost" },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cloudinaryPublicId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("LostItem", lostItemSchema);
