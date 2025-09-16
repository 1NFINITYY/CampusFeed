import mongoose from "mongoose";

const lostItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    status: { type: String, enum: ["lost", "found"], default: "lost" },
    postedBy: { type: String, required: true },   // 👤 Who reported it
    contactNo: { type: String, required: true },  // 📞 Contact number
  },
  { timestamps: true }
);

const LostItem = mongoose.model("LostItem", lostItemSchema);

export default LostItem;
