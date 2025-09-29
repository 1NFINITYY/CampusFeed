import { useState, useEffect } from "react";
import axios from "../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Items() {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ loading state
  const backendURL = import.meta.env.VITE_API_URL;

  const fetchItems = async () => {
    try {
      setLoading(true); // start loading
      const res = await axios.get(`${backendURL}/api/lostitems`);
      setLostItems(res.data);
    } catch (err) {
      toast.error("Error fetching items");
    } finally {
      setLoading(false); // stop loading
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const markFound = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");
    try {
      await axios.patch(
        `${backendURL}/api/lostitems/${id}/found`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Marked as found");
      fetchItems();
    } catch {
      toast.error("Failed to mark as found");
    }
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

      {/* ✅ Loading Button */}
      {loading && (
        <div className="flex justify-center mb-6">
          <button
            type="button"
            disabled
            className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md cursor-not-allowed"
          >
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
            Loading items...
          </button>
        </div>
      )}

      {/* Lost Items Grid */}
      {!loading && sortedItems.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No lost items reported yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading &&
            sortedItems.map((item) => (
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
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
