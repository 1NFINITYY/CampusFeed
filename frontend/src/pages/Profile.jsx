import { useEffect, useState } from "react";
import axios from "../context/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ loading state for profile
  const [activeTab, setActiveTab] = useState("feeds");
  const [currentIndexes, setCurrentIndexes] = useState({});
  const [selectedFeed, setSelectedFeed] = useState(null); // modal
  const [commentText, setCommentText] = useState("");
  const backendURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    if (!token) return toast.error("Please login first!");
    try {
      setLoading(true); // ✅ start loading
      const res = await axios.get(`${backendURL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);

      const feedIndexes = {};
      res.data.feeds.forEach((feed) => (feedIndexes[feed._id] = 0));
      setCurrentIndexes(feedIndexes);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch profile");
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await axios.post(`${backendURL}/profile/picture`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      toast.success("Profile picture updated!");
      setProfile((prev) => ({
        ...prev,
        user: { ...prev.user, profilePic: res.data.profilePic },
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFeed = async (feedId) => {
    if (!window.confirm("Are you sure you want to delete this feed?")) return;
    try {
      await axios.delete(`${backendURL}/api/feeds/${feedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Feed deleted successfully!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete feed");
    }
  };

  const handleDeleteLostItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this lost item?")) return;
    try {
      await axios.delete(`${backendURL}/api/lostitems/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Lost item deleted successfully!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete lost item");
    }
  };

  const handleDownloadPDF = async (fileUrl, fileName) => {
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

  const handleNext = (feedId, length) => {
    setCurrentIndexes((prev) => ({ ...prev, [feedId]: (prev[feedId] + 1) % length }));
  };

  const handlePrev = (feedId, length) => {
    setCurrentIndexes((prev) => ({ ...prev, [feedId]: (prev[feedId] - 1 + length) % length }));
  };

  const handleLike = async (feedId, liked) => {
    if (!token) return toast.error("Please login to like feeds!");

    try {
      const url = `${backendURL}/api/feeds/${feedId}/${liked ? "unlike" : "like"}`;
      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      setProfile((prev) => ({
        ...prev,
        feeds: prev.feeds.map((feed) =>
          feed._id === feedId
            ? {
                ...feed,
                likes: liked
                  ? feed.likes.filter((id) => id !== localStorage.getItem("userId")?.replace(/"/g, ""))
                  : [...feed.likes, localStorage.getItem("userId")?.replace(/"/g, "")]
              }
            : feed
        )
      }));

      if (selectedFeed?._id === feedId) {
        setSelectedFeed((prev) => ({
          ...prev,
          likes: liked
            ? prev.likes.filter((id) => id !== localStorage.getItem("userId")?.replace(/"/g, ""))
            : [...prev.likes, localStorage.getItem("userId")?.replace(/"/g, "")]
        }));
      }
    } catch {
      toast.error("Failed to update like");
    }
  };

  const handleAddComment = async () => {
    if (!token || !commentText.trim()) return;

    try {
      const newComment = {
        text: commentText,
        commentedBy: { username: profile.user.username },
        createdAt: new Date()
      };
      await axios.post(
        `${backendURL}/api/feeds/${selectedFeed._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommentText("");

      setProfile((prev) => ({
        ...prev,
        feeds: prev.feeds.map((feed) =>
          feed._id === selectedFeed._id ? { ...feed, comments: [...feed.comments, newComment] } : feed
        )
      }));

      setSelectedFeed((prev) => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  };

  // ✅ Full-screen loading screen before profile is ready
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
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
          Loading profile...
        </button>
      </div>
    );
  }

  const { user, feeds, lostItems } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Profile Header */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-2xl mb-6 border border-purple-200 text-center transition-transform hover:scale-105">
        <div className="relative w-36 h-36 mx-auto mb-4">
          <img
            src={user.profilePic || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover border-4 border-gradient-to-r from-purple-500 to-pink-500 shadow-lg transition-transform hover:scale-110"
          />
          <label className="absolute bottom-0 right-0 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-3 py-1 rounded-full shadow-md cursor-pointer text-sm font-semibold">
            {uploading ? "Uploading..." : "Change"}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-800">{user.username}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-600">📞 {user.phone}</p>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("feeds")}
          className={`px-6 py-2 rounded-xl font-semibold transition ${
            activeTab === "feeds"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              : "bg-white border border-purple-300 text-gray-700 hover:shadow-md"
          }`}
        >
          My Feeds
        </button>
        <button
          onClick={() => setActiveTab("lostItems")}
          className={`px-6 py-2 rounded-xl font-semibold transition ${
            activeTab === "lostItems"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              : "bg-white border border-purple-300 text-gray-700 hover:shadow-md"
          }`}
        >
          My Lost Items
        </button>
      </div>

      {/* Feeds Section */}
      {activeTab === "feeds" && (
        <div className="max-w-5xl mx-auto mb-12">
          {feeds.length === 0 ? (
            <p className="text-gray-600 text-center">No feeds posted yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {feeds.map((feed) => {
                const currentIndex = currentIndexes[feed._id] || 0;
                const currentFile = feed.files?.[currentIndex];
                const liked = feed.likes?.some(
                  (id) => id === localStorage.getItem("userId")?.replace(/"/g, "")
                );

                return (
                  <div
                    key={feed._id}
                    onClick={() => setSelectedFeed(feed)}
                    className="bg-white p-5 rounded-2xl shadow-lg border border-purple-100 flex flex-col transition-transform hover:scale-105 hover:shadow-2xl cursor-pointer w-full h-[400px] overflow-hidden"
                  >
                    {/* Carousel */}
                    {currentFile && (
                      <div className="relative flex justify-center items-center bg-gray-50 w-full h-[220px] mb-3">
                        {currentFile.type === "image" && (
                          <img
                            src={currentFile.url}
                            alt={feed.title}
                            className="max-h-full max-w-full object-contain rounded-xl"
                          />
                        )}
                        {currentFile.type === "video" && (
                          <video
                            src={currentFile.url}
                            controls
                            className="max-h-full max-w-full object-contain rounded-xl"
                          />
                        )}
                        {currentFile.type === "raw" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(currentFile.url, feed.title);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                          >
                            ⬇️ Download PDF
                          </button>
                        )}
                        {feed.files.length > 1 && (
                          <>
                            <button
                              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrev(feed._id, feed.files.length);
                              }}
                            >
                              ◀
                            </button>
                            <button
                              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNext(feed._id, feed.files.length);
                              }}
                            >
                              ▶
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <h4 className="font-bold text-gray-800 mb-1">{feed.title}</h4>
                    <p className="text-gray-600 flex-grow overflow-hidden text-ellipsis">
                      {feed.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(feed._id, liked);
                        }}
                        className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
                          liked
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {liked
                          ? `❤️ Liked (${feed.likes?.length || 0})`
                          : `🤍 Like (${feed.likes?.length || 0})`}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      🕒 {timeAgo(feed.createdAt)}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFeed(feed._id);
                      }}
                      className="mt-3 bg-gradient-to-r from-red-500 to-red-700 text-white py-2 rounded-xl shadow-md hover:from-red-600 hover:to-red-800 transition transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Feed Modal */}
      {selectedFeed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setSelectedFeed(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-full max-w-4xl mx-4 relative animate-scaleIn max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFeed(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
            >
              ✖
            </button>

            <div className="p-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-3 text-center">
                {selectedFeed.title}
              </h2>

              {/* Modal Carousel */}
              <div className="relative w-full flex justify-center items-center h-[300px] mb-4 bg-gray-50 rounded-xl overflow-hidden">
                {selectedFeed.files?.map((file, idx) => (
                  <div
                    key={idx}
                    className={`${
                      idx === currentIndexes[selectedFeed._id]
                        ? "block"
                        : "hidden"
                    } w-full h-full flex justify-center items-center`}
                  >
                    {file.type === "image" && (
                      <img
                        src={file.url}
                        alt={selectedFeed.title}
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    )}
                    {file.type === "video" && (
                      <video
                        src={file.url}
                        controls
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    )}
                    {file.type === "raw" && (
                      <button
                        onClick={() =>
                          handleDownloadPDF(file.url, selectedFeed.title)
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                      >
                        ⬇️ Download PDF
                      </button>
                    )}
                  </div>
                ))}

                {selectedFeed.files.length > 1 && (
                  <>
                    <button
                      className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev(
                          selectedFeed._id,
                          selectedFeed.files.length
                        );
                      }}
                    >
                      ◀
                    </button>
                    <button
                      className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext(
                          selectedFeed._id,
                          selectedFeed.files.length
                        );
                      }}
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-3 text-center">
                {selectedFeed.description}
              </p>

              <button
                onClick={() =>
                  handleLike(
                    selectedFeed._id,
                    selectedFeed.likes?.some(
                      (id) =>
                        id ===
                        localStorage.getItem("userId")?.replace(/"/g, "")
                    )
                  )
                }
                className={`px-4 py-2 rounded-full font-semibold text-sm mb-3 transition ${
                  selectedFeed.likes?.some(
                    (id) =>
                      id === localStorage.getItem("userId")?.replace(/"/g, "")
                  )
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {selectedFeed.likes?.some(
                  (id) =>
                    id === localStorage.getItem("userId")?.replace(/"/g, "")
                )
                  ? `❤️ Liked (${selectedFeed.likes?.length || 0})`
                  : `🤍 Like (${selectedFeed.likes?.length || 0})`}
              </button>

              {/* Comments */}
              <div className="w-full max-w-xl">
                <h3 className="font-semibold mb-2 text-gray-800">Comments</h3>
                <div className="max-h-64 overflow-y-auto mb-3">
                  {selectedFeed.comments?.length === 0 && (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                  )}
                  {selectedFeed.comments
                    ?.slice()
                    .reverse()
                    .map((c, idx) => (
                      <div
                        key={idx}
                        className="mb-2 border-b border-gray-200 pb-1"
                      >
                        <p className="text-gray-700 text-sm">
                          <span className="font-semibold">
                            {c.commentedBy?.username || "Anonymous"}:
                          </span>{" "}
                          {c.text}
                        </p>
                        <p className="text-gray-400 text-xs italic">
                          {timeAgo(c.createdAt)}
                        </p>
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
                    <button
                      onClick={handleAddComment}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
                    >
                      Post
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center">
                    Please login to comment
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-1">
                🕒 {timeAgo(selectedFeed.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lost Items Section */}
      {activeTab === "lostItems" && (
        <div className="max-w-5xl mx-auto mb-12">
          {lostItems.length === 0 ? (
            <p className="text-gray-600 text-center">
              No lost items posted yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-2xl shadow-lg border border-purple-100 flex flex-col w-full h-[400px] overflow-hidden"
                >
                  {item.imageUrl && (
                    <div className="flex justify-center items-center h-[220px] mb-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    </div>
                  )}
                  <h4 className="font-bold text-gray-800 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 flex-grow overflow-hidden text-ellipsis">
                    {item.description}
                  </p>
                  <span
                    className={`font-semibold mb-2 ${
                      item.status === "lost"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    Status: {item.status}
                  </span>
                  <button
                    onClick={() => handleDeleteLostItem(item._id)}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 rounded-xl shadow-md hover:from-red-600 hover:to-red-800 transition transform hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
