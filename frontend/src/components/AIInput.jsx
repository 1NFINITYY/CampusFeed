import { useState } from "react";
import axios from "../context/axiosInstance";
import { toast } from "react-toastify";

export default function AIInput({ onCreated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [files, setFiles] = useState([]);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 10);
    console.log("📸 Selected Files:", selectedFiles);
    setFiles(selectedFiles);
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem("token");
    console.log("🔑 Token found:", token ? "✅ Yes" : "❌ No");

    if (!token) {
      toast.error("Please login to use AI feature");
      return;
    }

    if (!text.trim()) {
      toast.warning("Enter some text first");
      return;
    }

    setLoading(true);
    console.log("🧠 Sending request to /api/ai/metadata with text:", text);

    try {
      const { data } = await axios.post(
        "/api/ai/metadata",
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Metadata Response:", data);
      setMetadata(data.metadata);
      toast.success("AI metadata generated!");
    } catch (error) {
      console.error("❌ Metadata Generation Error:", error.response?.data || error.message);
      toast.error("Failed to generate metadata");
    } finally {
      setLoading(false);
      console.log("🧩 Metadata generation process finished");
    }
  };

  const handleCreatePost = async () => {
    if (!metadata) {
      toast.warning("No AI metadata generated");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("🔑 Token (createPost):", token ? "✅ Yes" : "❌ No");

    if (!token) {
      toast.error("Please login");
      return;
    }

    setLoading(true);
    console.log("📝 Creating post with metadata:", metadata);
    console.log("📂 Attached files:", files);

    try {
      const formData = new FormData();
      formData.append("title", metadata.title || "Untitled");
      formData.append("description", metadata.description || text);

      if (metadata.type === "feed") {
        if (files.length > 0) {
          files.forEach((file) => formData.append("files", file));
          console.log(`🖼️ Appended ${files.length} file(s) to feed post`);
        }
        const res = await axios.post("/api/feeds", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Feed creation response:", res.data);
        toast.success("Feed post created 🚀");
      } else if (metadata.type === "lostitem") {
        if (files.length === 0) {
          toast.warning("Please attach 1 image for lost item");
          setLoading(false);
          return;
        }
        formData.append("image", files[0]);
        console.log("📸 Appended 1 image for lost item");
        const res = await axios.post("/api/lostitems", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Lost item creation response:", res.data);
        toast.success("Lost item post created 🏷️");
      }

      setMetadata(null);
      setText("");
      setFiles([]);
      if (onCreated) onCreated();
    } catch (error) {
      console.error("❌ Post creation failed:", error.response?.data || error.message);
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
      console.log("🧩 Post creation process finished");
    }
  };

  return (
    <div className="border p-4 rounded-xl mb-6 relative">
      <div className="flex justify-between items-center mb-2 relative">
        <h3 className="font-semibold">🧠 AI Post Generator</h3>
        <div className="relative group">
          <span className="text-gray-500 hover:text-gray-700 cursor-pointer">👁️</span>
          <div className="absolute right-0 top-full mt-1 w-60 p-2 bg-gray-100 text-gray-700 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <p><strong>Lost items:</strong> Attach exactly 1 image.</p>
            <p><strong>Feed posts:</strong> Attach up to 10 files (image, video, or PDF).</p>
          </div>
        </div>
      </div>

      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter description for AI"
        className="w-full p-2 border rounded-lg mb-2"
      />

      <label className="block mb-2">
        <span className="sr-only">Choose Photos</span>
        <button
          type="button"
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Choose Photos
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

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, idx) => (
            <div key={idx} className="w-20 h-20 border rounded overflow-hidden relative">
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

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleGenerate}
          disabled={loading || !text}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Metadata"}
        </button>

        {metadata && (
          <button
            onClick={handleCreatePost}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : `Create ${metadata.type === "feed" ? "Feed" : "Lost Item"}`}
          </button>
        )}
      </div>

      {metadata && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm">
          <strong>AI Metadata:</strong>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
