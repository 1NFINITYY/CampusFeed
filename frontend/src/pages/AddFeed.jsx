import { useState } from "react";
import axios from "axios";
import AIInput from "../components/AIInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddFeed() {
  const [newFeed, setNewFeed] = useState({
    title: "",
    description: "",
    postedBy: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendURL = "http://localhost:5000";

  const handleAddFeed = async () => {
    if (!newFeed.title || !newFeed.description || !newFeed.postedBy) {
      return toast.warning("⚠️ Please fill all fields");
    }

    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", newFeed.title);
      formData.append("description", newFeed.description);
      formData.append("postedBy", newFeed.postedBy);
      if (newFeed.image) formData.append("image", newFeed.image);

      await axios.post(`${backendURL}/api/feeds`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewFeed({ title: "", description: "", postedBy: "", image: null });
      setPreview(null);
      toast.success("✅ Feed posted successfully!");
    } catch (err) {
      console.error("Error posting feed:", err);
      toast.error("❌ Failed to post feed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewFeed((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12">
        Campus Feed
      </h1>

      {/* AI Section */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl border mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">✨ AI Post Generator</h2>
        <AIInput onCreated={() => toast.info("📝 Post created via AI!")} />
      </div>

      {/* Manual Post Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">📝 Share Something</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Post Title"
            value={newFeed.title}
            onChange={(e) =>
              setNewFeed((prev) => ({ ...prev, title: e.target.value }))
            }
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            placeholder="Write something interesting..."
            rows="4"
            value={newFeed.description}
            onChange={(e) =>
              setNewFeed((prev) => ({ ...prev, description: e.target.value }))
            }
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="text"
            placeholder="Your Name"
            value={newFeed.postedBy}
            onChange={(e) =>
              setNewFeed((prev) => ({ ...prev, postedBy: e.target.value }))
            }
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-gray-600"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-48 h-48 object-cover rounded-xl shadow-md mx-auto"
            />
          )}
          <button
            onClick={handleAddFeed}
            disabled={loading}
            className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-105 ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-purple-600 hover:to-pink-600"
            }`}
          >
            {loading ? "⏳ Posting..." : "🚀 Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
