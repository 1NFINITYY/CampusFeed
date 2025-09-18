import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    postedBy: { type: String, required: true },
  },
  { timestamps: true }
);

const Feed = mongoose.model("Feed", feedSchema);

export default Feed;
