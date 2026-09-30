import { useState } from "react";
import axios from "../context/axiosInstance";
import { toast } from "react-toastify";

// Helper: convert a File to base64 string (strips the data:...;base64, prefix)
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });

export default function AIInput({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [files, setFiles] = useState([]);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 10);
    setFiles(selectedFiles);
    setMetadata(null);
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to use AI feature");
      return;
    }

    if (files.length === 0) {
      toast.warning("Please choose at least one image first");
      return;
    }

    const imageFile = files.find((f) => f.type.startsWith("image/"));
    if (!imageFile) {
      toast.warning("Please include at least one image for AI to analyze");
      return;
    }

    setLoading(true);
    try {
      const imageBase64 = await fileToBase64(imageFile);

      const { data } = await axios.post(
        "/api/ai/metadata",
        { imageBase64, mimeType: imageFile.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMetadata(data.metadata);
      toast.success("✨ AI analyzed your image!");
    } catch (error) {
      toast.error(error.response?.data?.details || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!metadata) {
      toast.warning("No AI metadata generated yet");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", metadata.title || "Untitled");
      formData.append("description", metadata.description || "");

      if (metadata.type === "feed") {
        files.forEach((file) => formData.append("files", file));
        await axios.post("/api/feeds", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Feed post created 🚀");
      } else if (metadata.type === "lostitem") {
        if (files.length === 0) {
          toast.warning("Please attach an image for the lost item");
          setLoading(false);
          return;
        }
        formData.append("image", files[0]);
        await axios.post("/api/lostitems", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Lost item posted 🏷️");
      }

      setMetadata(null);
      setFiles([]);
      if (onCreated) onCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-xl mb-6 relative">
      <div className="flex justify-between items-center mb-3 relative">
        <h3 className="font-semibold">🧠 AI Post Generator</h3>
        <div className="relative group">
          <span className="text-gray-500 hover:text-gray-700 cursor-pointer">👁️</span>
          <div className="absolute right-0 top-full mt-1 w-64 p-2 bg-gray-100 text-gray-700 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <p>Upload an image and click <strong>Analyze Image</strong>.</p>
            <p className="mt-1"><strong>Lost items:</strong> Attach exactly 1 image.</p>
            <p><strong>Feed posts:</strong> Attach up to 10 files.</p>
          </div>
        </div>
      </div>

      {/* File picker */}
      <label className="block mb-3">
        <span className="sr-only">Choose Photos</span>
        <button
          type="button"
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
          onClick={() => document.getElementById("fileInput").click()}
        >
          📷 Choose Photos / Videos
        </button>
        <input
          id="fileInput"
          type="file"
          multiple
          onChange={handleFilesChange}
          className="hidden"
          accept="image/*,video/*,application/pdf"
        />
      </label>

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, idx) => (
            <div key={idx} className="w-20 h-20 border rounded overflow-hidden">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-xs text-gray-700 p-1 text-center">
                  {file.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">
          📂 No files selected. Choose an image and AI will analyze it automatically.
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={handleGenerate}
          disabled={loading || files.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {loading ? "Analyzing..." : "✨ Analyze Image"}
        </button>

        {metadata && (
          <button
            onClick={handleCreatePost}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
          >
            {loading ? "Creating..." : `🚀 Create ${metadata.type === "feed" ? "Feed Post" : "Lost Item"}`}
          </button>
        )}
      </div>

      {/* Metadata preview */}
      {metadata && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm border">
          <p className="font-semibold mb-1">🤖 AI Generated:</p>
          <p><span className="text-gray-500">Title:</span> {metadata.title}</p>
          <p><span className="text-gray-500">Description:</span> {metadata.description}</p>
          <p>
            <span className="text-gray-500">Type:</span>{" "}
            <span className={`font-medium ${metadata.type === "lostitem" ? "text-red-500" : "text-green-600"}`}>
              {metadata.type === "lostitem" ? "🏷️ Lost Item" : "📰 Feed Post"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
