import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video", "raw"], required: true },
  cloudinaryPublicId: { type: String },
});

const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const FeedSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    files: {
      type: [FileSchema],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
      default: [],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // array of user IDs who liked
    comments: [CommentSchema], // embedded comments
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 10;
}

export default mongoose.model("Feed", FeedSchema);
