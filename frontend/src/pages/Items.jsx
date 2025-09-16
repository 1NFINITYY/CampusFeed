import { useState, useEffect } from "react";
import axios from "axios";

export default function Items() {
  const [lostItems, setLostItems] = useState([]);
  const [newItem, setNewItem] = useState({ title: "", description: "", image: null });
  const [preview, setPreview] = useState(null);
  const backendURL = "http://localhost:5000"; // Your backend

  // Fetch all items
  const fetchItems = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/lostitems`);
      setLostItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add item
  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description) return alert("Please fill all fields");
    try {
      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("description", newItem.description);
      if (newItem.image) formData.append("image", newItem.image);

      await axios.post(`${backendURL}/api/lostitems`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewItem({ title: "", description: "", image: null });
      setPreview(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to add item");
    }
  };

  // Mark as found
  const markFound = async (id) => {
    try {
      await axios.patch(`${backendURL}/api/lostitems/${id}/found`);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as found");
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${backendURL}/api/lostitems/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  };

  // Image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewItem({ ...newItem, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // Sort lost items first
  const sortedItems = [...lostItems].sort((a, b) =>
    a.status === "lost" && b.status === "found" ? -1 : 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4 md:px-8">
      <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-800 mb-12">
        Lost & Found Dashboard
      </h1>

      {/* Add Item Form */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-200">
        <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">Report a Lost Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-center text-gray-700"
          />
          <textarea
            rows="3"
            placeholder="Description / Location"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 text-center"
          />
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
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition transform hover:scale-105"
            >
              Add Item
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
              className={`bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col transform transition hover:scale-105 ${
                item.status === "found" ? "opacity-50" : ""
              }`}
            >
              {/* Image */}
              {item.imageUrl && (
                <img
                  src={`${backendURL}${item.imageUrl}`}
                  alt={item.title}
                  className="w-full h-64 object-cover rounded-t-3xl"
                />
              )}

              {/* Card Content */}
              <div className="flex flex-col flex-1 justify-between p-6 text-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Item lost: {item.title}</h3>
                  <p className="text-gray-600 mb-2">Description: {item.description}</p>
                  <span className="text-gray-500 font-medium">Status: {item.status}</span>
                </div>

                {/* Action Buttons */}
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
