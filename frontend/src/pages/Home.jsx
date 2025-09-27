import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentIndexes, setCurrentIndexes] = useState({});
  const [commentText, setCommentText] = useState("");
  const backendURL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendURL}/api/feeds`);
      setPosts(data);
      const initialIndexes = {};
      data.forEach((p) => (initialIndexes[p._id] = 0));
      setCurrentIndexes(initialIndexes);
    } catch {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName || "document"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleNext = (postId, length) => {
    setCurrentIndexes((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % length,
    }));
  };

  const handlePrev = (postId, length) => {
    setCurrentIndexes((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + length) % length,
    }));
  };

  // Optimistic Like Handler
  const handleLike = async (postId, liked) => {
    if (!token) return toast.error("Please login to like posts!");

    try {
      const url = `${backendURL}/api/feeds/${postId}/${liked ? "unlike" : "like"}`;
      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      // Update posts state
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: liked
                  ? post.likes.filter((id) => id !== localStorage.getItem("userId")?.replace(/"/g, ""))
                  : [...post.likes, localStorage.getItem("userId")?.replace(/"/g, "")],
              }
            : post
        )
      );

      // Update modal if open
      if (selectedPost?._id === postId) {
        setSelectedPost((prev) => ({
          ...prev,
          likes: liked
            ? prev.likes.filter((id) => id !== localStorage.getItem("userId")?.replace(/"/g, ""))
            : [...prev.likes, localStorage.getItem("userId")?.replace(/"/g, "")],
        }));
      }
    } catch {
      toast.error("Failed to update like");
    }
  };

  const handleAddComment = async () => {
    if (!token) return toast.error("Please login to comment!");
    if (!commentText.trim()) return;

    try {
      await axios.post(
        `${backendURL}/api/feeds/${selectedPost._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommentText("");

      // Refetch posts to get updated comments
      const { data } = await axios.get(`${backendURL}/api/feeds`);
      setPosts(data);

      // Update modal comments
      const updatedPost = data.find((p) => p._id === selectedPost._id);
      if (updatedPost) setSelectedPost(updatedPost);
    } catch {
      toast.error("Failed to add comment");
    }
  };

  // Time helper
  const timeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue py-8 px-4 md:px-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Campus Feed</h1>
        <p className="text-gray-600 text-lg md:text-xl">Stay updated with the latest posts and opportunities!</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {!loading &&
          posts.map((post) => {
            const currentIndex = currentIndexes[post._id] || 0;
            const currentFile = post.files?.[currentIndex];
            const liked = token && post.likes?.some((id) => id === localStorage.getItem("userId")?.replace(/"/g, ""));

            return (
              <div
                key={post._id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-xl cursor-pointer w-full h-[400px]"
              >
                {currentFile && (
                  <div className="relative flex justify-center items-center bg-gray-50 w-full h-[220px]">
                    {currentFile.type === "image" && <img src={currentFile.url} alt={post.title} className="max-h-full max-w-full object-contain" />}
                    {currentFile.type === "video" && <video src={currentFile.url} controls className="max-h-full max-w-full object-contain" />}
                    {currentFile.type === "raw" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(currentFile.url, post.title);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition transform hover:scale-105"
                      >
                        ⬇️ Download PDF
                      </button>
                    )}

                    {post.files.length > 1 && (
                      <>
                        <button
                          className="absolute top-1/2 left-2 bg-white/50 rounded-full p-2 shadow hover:bg-white/70 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrev(post._id, post.files.length);
                          }}
                        >
                          ◀
                        </button>
                        <button
                          className="absolute top-1/2 right-2 bg-white/50 rounded-full p-2 shadow hover:bg-white/70 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNext(post._id, post.files.length);
                          }}
                        >
                          ▶
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                    <p
                      className="text-gray-700 text-sm overflow-hidden text-ellipsis whitespace-normal max-h-[4.5rem]"
                      style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
                    >
                      {post.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post._id, liked);
                      }}
                      className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
                        liked ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {liked ? "❤️ Liked" : "🤍 Like"} ({post.likes?.length || 0})
                    </button>
                    <p className="text-gray-500 text-sm italic">✍️ {post.postedBy?.username || "Anonymous"}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">🕒 {timeAgo(post.createdAt)}</p>
                </div>
              </div>
            );
          })}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl mx-4 relative animate-scaleIn max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPost(null)} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl">✖</button>

            <div className="p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-3 text-center">{selectedPost.title}</h2>

              {/* Files Carousel */}
              <div className="relative w-full flex justify-center items-center h-[300px] mb-4 bg-gray-50 rounded-xl">
                {selectedPost.files?.map((file, idx) => (
                  <div key={idx} className={`${idx === currentIndexes[selectedPost._id] ? "block" : "hidden"} w-full h-full flex justify-center items-center`}>
                    {file.type === "image" && <img src={file.url} alt={selectedPost.title} className="max-h-full max-w-full object-contain rounded-xl" />}
                    {file.type === "video" && <video src={file.url} controls className="max-h-full max-w-full object-contain rounded-xl" />}
                    {file.type === "raw" && (
                      <button onClick={() => handleDownload(file.url, selectedPost.title)} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition transform hover:scale-105">
                        ⬇️ Download PDF
                      </button>
                    )}
                  </div>
                ))}

                {selectedPost.files.length > 1 && (
                  <>
                    <button
                      className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev(selectedPost._id, selectedPost.files.length);
                      }}
                    >
                      ◀
                    </button>
                    <button
                      className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext(selectedPost._id, selectedPost.files.length);
                      }}
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-3 text-center">{selectedPost.description}</p>

              {/* Modal Like */}
              <button
                onClick={() =>
                  handleLike(
                    selectedPost._id,
                    selectedPost.likes?.some(
                      (id) => id === localStorage.getItem("userId")?.replace(/"/g, "")
                    )
                  )
                }
                className={`px-4 py-2 rounded-full font-semibold text-sm mb-3 transition ${
                  selectedPost.likes?.some(
                    (id) => id === localStorage.getItem("userId")?.replace(/"/g, "")
                  )
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {selectedPost.likes?.some(
                  (id) => id === localStorage.getItem("userId")?.replace(/"/g, "")
                )
                  ? `❤️ Liked (${selectedPost.likes?.length || 0})`
                  : `🤍 Like (${selectedPost.likes?.length || 0})`}
              </button>

              {/* Comments */}
              <div className="w-full max-w-xl">
                <h3 className="font-semibold mb-2 text-gray-800">Comments</h3>
                <div className="max-h-64 overflow-y-auto mb-3">
                  {selectedPost.comments?.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
                  {selectedPost.comments?.slice().reverse().map((c, idx) => (
                    <div key={idx} className="mb-2 border-b border-gray-200 pb-1">
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">{c.commentedBy?.username || "Anonymous"}:</span> {c.text}
                      </p>
                      <p className="text-gray-400 text-xs italic">{timeAgo(c.createdAt)}</p>
                    </div>
                  ))}
                </div>

                {token ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button onClick={handleAddComment} className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition transform hover:scale-105">
                      Post
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center">
                    Please <Link to="/login" className="text-purple-500 underline">login</Link> to comment
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-500 italic mt-3">✍️ Posted by: {selectedPost.postedBy?.username || "Anonymous"}</p>
              <p className="text-xs text-gray-400 mt-1">🕒 {timeAgo(selectedPost.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
