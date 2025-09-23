import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Items() {
  const [lostItems, setLostItems] = useState([]);
  const [newItem, setNewItem] = useState({ title: "", description: "", image: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const backendURL = "http://localhost:5000";

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/lostitems`);
      setLostItems(res.data);
    } catch (err) {
      toast.error("Error fetching items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description) {
      return toast.warning(" Please fill all fields");
    }

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("description", newItem.description);
      if (newItem.image) formData.append("image", newItem.image);

      await axios.post(`${backendURL}/api/lostitems`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setNewItem({ title: "", description: "", image: null });
      setPreview(null);
      toast.success(" Item added successfully!");
      fetchItems();
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const markFound = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");
    try {
      await axios.patch(`${backendURL}/api/lostitems/${id}/found`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Marked as found");
      fetchItems();
    } catch {
      toast.error("Failed to mark as found");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");
    try {
      await axios.delete(`${backendURL}/api/lostitems/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item deleted successfully");
      fetchItems();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewItem({ ...newItem, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const sortedItems = [...lostItems].sort((a, b) =>
    a.status === "lost" && b.status === "found" ? -1 : 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-800 mb-12">
        Lost & Found Section
      </h1>

      {/* Add Item Form */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-black-200 mb-12">
        <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
          Report a Lost Item
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

          {/* Image Upload & Button */}
          <div className="flex flex-col items-center md:col-span-2 gap-4">
            <label className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-md font-semibold">
              Choose Image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-64 h-64 object-cover rounded-2xl shadow-md"
              />
            )}
            <button
              onClick={handleAddItem}
              disabled={loading}
              className={`bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition transform hover:scale-105 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Uploading..." : "Add Item"}
            </button>
          </div>
        </div>
      </div>

      {/* Lost Items Grid */}
      {sortedItems.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No lost items reported yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedItems.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl shadow-xl border border-pink-200 flex flex-col transform transition hover:scale-105 ${
                item.status === "found" ? "opacity-50" : ""
              }`}
            >
              {item.imageUrl && (
                <div className="w-full h-64 overflow-hidden rounded-t-2xl">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}

              <div className="flex flex-col flex-1 justify-between p-6 text-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-gray-700 font-medium mb-1">
                    Posted By: {item.postedBy?.username || "Anonymous"}
                  </p>
                  {item.postedBy?.phone && (
                    <p className="text-gray-700 font-medium mb-1">📞: {item.postedBy.phone}</p>
                  )}
                  {item.createdAt && (
                    <p className="text-gray-500 text-sm mb-2">
                      Posted on: {new Date(item.createdAt).toLocaleString()}
                    </p>
                  )}
                  <span
                    className={`font-semibold ${
                      item.status === "lost" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    Status: {item.status}
                  </span>
                </div>

                <div className="mt-6 flex flex-col md:flex-row gap-4 justify-center">
                  <button
                    onClick={() => markFound(item._id)}
                    disabled={item.status === "found"}
                    className={`flex-1 py-3 rounded-xl text-white font-semibold transition transform hover:scale-105 ${
                      item.status === "found"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {item.status === "lost" ? "Mark Found" : "Found"}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition transform hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
