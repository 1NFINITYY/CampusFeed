import mongoose from "mongoose";

const lostItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    status: { type: String, enum: ["lost", "found"], default: "lost" },
    postedBy: { 
      type: mongoose.Schema.Types.ObjectId, // store reference
      ref: "User",                          // must match User model
      required: true 
    },
    contactNo: { type: String, required: true },
  },
  { timestamps: true }
);

const LostItem = mongoose.model("LostItem", lostItemSchema);

export default LostItem;
