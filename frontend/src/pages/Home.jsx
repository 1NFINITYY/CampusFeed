import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const backendURL = "http://localhost:5000"; // still used for API calls, not images

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/feeds`);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("❌ Failed to fetch posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Delete a post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${backendURL}/api/feeds/${id}`);
      setPosts(posts.filter((post) => post._id !== id));
      toast.success("✅ Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error("❌ Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue py-8 px-4 md:px-8">
      {/* Toastify Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Campus Feed
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Stay updated with the latest posts and opportunities!
        </p>
      </div>

      {/* No posts */}
      {posts.length === 0 && (
        <p className="text-center text-gray-500 text-lg">
          No posts yet. Be the first to share something!
        </p>
      )}

      {/* Posts grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-xl"
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl} // ✅ now uses Cloudinary full URL directly
                alt={post.title}
                className="w-full h-48 md:h-56 object-cover"
              />
            )}
            <div className="p-5 flex flex-col flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                {post.title}
              </h2>
              <p className="text-gray-700 flex-1">{post.description}</p>

              {/* Posted By */}
              <p className="text-gray-500 text-sm mt-3 italic">
                ✍️ Posted by: {post.postedBy || "Anonymous"}
              </p>

              {/* Timestamp */}
              {post.createdAt && (
                <p className="text-gray-400 text-xs mt-1">
                  🕒 {new Date(post.createdAt).toLocaleString()}
                </p>
              )}

              <button
                onClick={() => handleDelete(post._id)}
                className="mt-4 self-start bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 px-4 rounded-lg shadow-sm transition transform hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
