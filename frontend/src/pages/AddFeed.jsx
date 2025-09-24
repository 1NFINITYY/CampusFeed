import { useState } from "react";
import axios from "axios";
import AIInput from "../components/AIInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddFeed() {
  const [newFeed, setNewFeed] = useState({
    title: "",
    description: "",
    file: null,
  });
  const [feedPreview, setFeedPreview] = useState(null);
  const [feedPreviewType, setFeedPreviewType] = useState(null);
  const [feedLoading, setFeedLoading] = useState(false);

  // For Lost Items
  const [newItem, setNewItem] = useState({ title: "", description: "", image: null });
  const [itemPreview, setItemPreview] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);

  const backendURL = "http://localhost:5000";

  /*** FEED FUNCTIONS ***/
  const handleAddFeed = async () => {
    if (!newFeed.title || !newFeed.description) {
      return toast.warning("Please fill all fields for feed");
    }

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    setFeedLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newFeed.title);
      formData.append("description", newFeed.description);
      if (newFeed.file) formData.append("file", newFeed.file);

      await axios.post(`${backendURL}/api/feeds`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setNewFeed({ title: "", description: "", file: null });
      setFeedPreview(null);
      setFeedPreviewType(null);
      toast.success("Feed posted successfully!");
    } catch {
      toast.error("Failed to post feed");
    } finally {
      setFeedLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let type = file.type;
    let previewUrl = URL.createObjectURL(file);

    if (type.startsWith("image/")) setFeedPreviewType("image");
    else if (type.startsWith("video/")) setFeedPreviewType("video");
    else if (type === "application/pdf") setFeedPreviewType("pdf");
    else setFeedPreviewType(null);

    setNewFeed((prev) => ({ ...prev, file }));
    setFeedPreview(previewUrl);
  };

  /*** LOST ITEM FUNCTIONS ***/
  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description) {
      return toast.warning("Please fill all fields for lost item");
    }

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    setItemLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("description", newItem.description);
      if (newItem.image) formData.append("image", newItem.image);

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
    setItemPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12">
        Campus Feed & Lost Items
      </h1>

      {/* AI Section */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl border mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          ✨ AI Post Generator
        </h2>
        <AIInput onCreated={() => toast.info("📝 Post created via AI!")} />
      </div>

      {/* Manual Feed Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📝 Share Something
        </h2>
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

          {/* Feed File Upload */}
          <div className="flex flex-col items-center gap-3">
            <input
              type="file"
              accept="image/*,video/*,.pdf"
              onChange={handleFileChange}
              id="feedFileInput"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("feedFileInput").click()}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-xl font-medium shadow-md hover:from-green-600 hover:to-green-800 transition"
            >
              📂 {newFeed.file ? "Change File" : "Choose File"}
            </button>

            {feedPreview && feedPreviewType === "image" && (
              <img src={feedPreview} alt="Preview" className="w-48 h-48 object-cover rounded-xl shadow-md" />
            )}
            {feedPreview && feedPreviewType === "video" && (
              <video src={feedPreview} controls className="w-64 h-48 rounded-xl shadow-md" />
            )}
            {feedPreview && feedPreviewType === "pdf" && (
              <p className="text-green-600 underline">📄 PDF ready to upload</p>
            )}
          </div>

          <button
            onClick={handleAddFeed}
            disabled={feedLoading}
            className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-105 ${
              feedLoading ? "opacity-50 cursor-not-allowed" : "hover:from-purple-600 hover:to-pink-600"
            }`}
          >
            {feedLoading ? "⏳ Posting..." : "🚀 Post"}
          </button>
        </div>
      </div>

      {/* Add Lost Item Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          🏷️ Report a Lost Item
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="w-full p-4 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          />
          <textarea
            rows="3"
            placeholder="Description / Location"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full p-4 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          />

          <div className="flex flex-col items-center md:col-span-2 gap-4">
            <label className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-md font-semibold">
              Choose Image
              <input type="file" accept="image/*" onChange={handleItemImageChange} className="hidden" />
            </label>
            {itemPreview && (
              <img
                src={itemPreview}
                alt="Preview"
                className="w-64 h-64 object-cover rounded-2xl shadow-md"
              />
            )}
            <button
              onClick={handleAddItem}
              disabled={itemLoading}
              className={`bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition transform hover:scale-105 ${
                itemLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {itemLoading ? "Uploading..." : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
