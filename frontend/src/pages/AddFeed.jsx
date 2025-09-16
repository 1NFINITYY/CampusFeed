import { useState } from "react";
import axios from "axios";
import AIInput from "../components/AIInput";

export default function AddFeed() {
  const [newFeed, setNewFeed] = useState({ title: "", description: "", image: null });
  const [preview, setPreview] = useState(null);

  const backendURL = "http://localhost:5000";

  const handleAddFeed = async () => {
    if (!newFeed.title || !newFeed.description) {
      return alert("⚠️ Please fill all fields");
    }
    try {
      const formData = new FormData();
      formData.append("title", newFeed.title);
      formData.append("description", newFeed.description);
      if (newFeed.image) formData.append("image", newFeed.image);

      await axios.post(`${backendURL}/api/feeds`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewFeed({ title: "", description: "", image: null });
      setPreview(null);
      alert("✅ Feed posted successfully!");
    } catch (err) {
      console.error("Error posting feed:", err);
      alert("❌ Failed to post feed");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewFeed({ ...newFeed, image: file });
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12">
        Campus Feed
      </h1>

      {/* AI Section */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl border mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">✨ AI Post Generator</h2>
        <AIInput onCreated={() => alert("Post created via AI!")} />
      </div>

      {/* Manual Post Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">📝 Share Something</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Post Title"
            value={newFeed.title}
            onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            placeholder="Write something interesting..."
            rows="4"
            value={newFeed.description}
            onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-105"
          >
            🚀 Post
          </button>
        </div>
      </div>
    </div>
  );
}
