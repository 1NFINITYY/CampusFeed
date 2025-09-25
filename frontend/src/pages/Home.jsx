import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ loading state
  const backendURL = import.meta.env.VITE_API_URL; // backend API

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      setLoading(true); // start loading
      const { data } = await axios.get(`${backendURL}/api/feeds`);
      setPosts(data);
    } catch (err) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false); // stop loading
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Function to download PDF with correct extension
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName || "document"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue py-8 px-4 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Campus Feed
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Stay updated with the latest posts and opportunities!
        </p>
      </div>

      {/* ✅ Loading Button */}
      {loading && (
        <div className="flex justify-center mb-8">
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
            Loading posts...
          </button>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500 text-lg">
          No posts yet. Be the first to share something!
        </p>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {!loading &&
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-xl"
            >
              {/* File Preview */}
              {post.resourceType === "image" && post.fileUrl && (
                <img
                  src={post.fileUrl}
                  alt={post.title}
                  className="w-full h-48 md:h-56 object-cover"
                />
              )}

              {post.resourceType === "video" && post.fileUrl && (
                <video
                  src={post.fileUrl}
                  controls
                  className="w-full h-48 md:h-56 object-cover"
                />
              )}

              {post.resourceType === "raw" && post.fileUrl && (
                <div className="flex items-center justify-center h-48 md:h-56 bg-gray-100">
                  <button
                    onClick={() => handleDownload(post.fileUrl, post.title)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                  >
                    ⬇️ Download PDF
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-700 flex-1">{post.description}</p>

                {/* Posted By */}
                <p className="text-gray-500 text-sm mt-3 italic">
                  ✍️ Posted by: {post.postedBy?.username || "Anonymous"}
                </p>

                {/* Timestamp */}
                {post.createdAt && (
                  <p className="text-gray-400 text-xs mt-1">
                    🕒 {new Date(post.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
