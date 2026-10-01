import { useState } from "react";
import axios from "../context/axiosInstance";
import AIInput from "../components/AIInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddFeed() {
  const [newFeed, setNewFeed] = useState({ title: "", description: "", files: [] });
  const [feedPreviews, setFeedPreviews] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const [newItem, setNewItem] = useState({ title: "", description: "", image: null });
  const [itemPreview, setItemPreview] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);

  const backendURL = import.meta.env.VITE_API_URL;

  /*** FEED FUNCTIONS ***/
  const handleAddFeed = async () => {
    if (!newFeed.title || !newFeed.description) return toast.warning("Please fill all fields for feed");
    if (newFeed.files.length === 0) return toast.warning("Please choose at least one file for the feed");

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    setFeedLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newFeed.title);
      formData.append("description", newFeed.description);
      newFeed.files.forEach((file) => formData.append("files", file));

      await axios.post(`${backendURL}/api/feeds`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setNewFeed({ title: "", description: "", files: [] });
      setFeedPreviews([]);
      toast.success("Feed posted successfully!");
    } catch {
      toast.error("Failed to post feed");
    } finally {
      setFeedLoading(false);
    }
  };

  const handleFilesChange = (e) => {
    const incoming = Array.from(e.target.files);
    const merged = [...newFeed.files, ...incoming].slice(0, 10);
    const previews = merged.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type === "application/pdf"
        ? "pdf"
        : "other",
    }));
    setNewFeed((prev) => ({ ...prev, files: merged }));
    setFeedPreviews(previews);
    e.target.value = "";
  };

  const handleRemoveFeedFile = (idx) => {
    const files = newFeed.files.filter((_, i) => i !== idx);
    const previews = feedPreviews.filter((_, i) => i !== idx);
    setNewFeed((prev) => ({ ...prev, files }));
    setFeedPreviews(previews);
  };

  /*** LOST ITEM FUNCTIONS ***/
  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description) return toast.warning("Please fill all fields for lost item");
    if (!newItem.image) return toast.warning("Please choose an image for the lost item");

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    setItemLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("description", newItem.description);
      formData.append("image", newItem.image);

      await axios.post(`${backendURL}/api/lostitems`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setNewItem({ title: "", description: "", image: null });
      setItemPreview(null);
      toast.success("Lost item added successfully!");
    } catch {
      toast.error("Failed to add lost item");
    } finally {
      setItemLoading(false);
    }
  };

  const handleItemImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewItem({ ...newItem, image: file });
    setItemPreview({ url: URL.createObjectURL(file), name: file.name });
    e.target.value = "";
  };

  const handleRemoveItemImage = () => {
    setNewItem((prev) => ({ ...prev, image: null }));
    setItemPreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12">
        Campus Feed &amp; Lost Items
      </h1>

      {/* AI Section */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl border mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">✨ AI Post Generator</h2>
        <AIInput onCreated={() => toast.info("📝 Post created via AI!")} />
      </div>

      {/* Manual Feed Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">📝 Share Something</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Post Title"
            value={newFeed.title}
            onChange={(e) => setNewFeed((prev) => ({ ...prev, title: e.target.value }))}
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            placeholder="Write something interesting..."
            rows="4"
            value={newFeed.description}
            onChange={(e) => setNewFeed((prev) => ({ ...prev, description: e.target.value }))}
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={handleFilesChange}
            id="feedFileInput"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("feedFileInput").click()}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:from-green-600 hover:to-teal-600 transition"
          >
            📂 {newFeed.files.length ? `Add More Files (${newFeed.files.length}/10)` : "Choose Files (max 10)"}
          </button>

          {feedPreviews.length > 0 ? (
            <div className="flex flex-wrap gap-3 mt-1">
              {feedPreviews.map((preview, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-sm group">
                  {preview.type === "image" && (
                    <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
                  )}
                  {preview.type === "video" && (
                    <video src={preview.url} className="w-full h-full object-cover" />
                  )}
                  {(preview.type === "pdf" || preview.type === "other") && (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-xs text-gray-600 p-1 text-center leading-tight">
                      📄 {preview.name.length > 12 ? preview.name.slice(0, 12) + "…" : preview.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeedFile(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">📂 No files selected yet.</p>
          )}

          <button
            onClick={handleAddFeed}
            disabled={feedLoading}
            className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-105 ${
              feedLoading ? "opacity-50 cursor-not-allowed" : "hover:from-purple-600 hover:to-pink-600"
            }`}
          >
            {feedLoading ? "⏳ Posting..." : "🚀 Post"}
          </button>
        </div>
      </div>

      {/* Lost Item Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">🏷️ Report a Lost Item</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            placeholder="Description / Location"
            rows="4"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleItemImageChange}
            id="itemImageInput"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("itemImageInput").click()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:from-purple-600 hover:to-pink-600 transition"
          >
            🖼️ {itemPreview ? "Change Image" : "Choose Image"}
          </button>

          {itemPreview ? (
            <div className="flex gap-3 mt-1">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-sm group">
                <img src={itemPreview.url} alt={itemPreview.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveItemImage}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">🖼️ No image selected yet.</p>
          )}

          <button
            onClick={handleAddItem}
            disabled={itemLoading}
            className={`w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-105 ${
              itemLoading ? "opacity-50 cursor-not-allowed" : "hover:from-green-600 hover:to-teal-600"
            }`}
          >
            {itemLoading ? "Uploading..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}