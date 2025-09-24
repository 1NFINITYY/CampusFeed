import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("feeds"); // "feeds" or "lostItems"
  const backendURL = "https://campusfeed-backend.onrender.com/";

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    try {
      const res = await axios.get(`${backendURL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first!");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const res = await axios.post(`${backendURL}/profile/picture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
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

    const token = localStorage.getItem("token");
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

    const token = localStorage.getItem("token");
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

  // ✅ Function to download PDFs with proper extension
  const handleDownloadPDF = async (fileUrl, fileName) => {
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

  if (!profile) return <p className="text-center mt-10 text-gray-700">Loading...</p>;

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

      {/* Tab Buttons */}
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
              {feeds.map((feed) => (
                <div
                  key={feed._id}
                  className="bg-white p-5 rounded-2xl shadow-lg border border-purple-100 flex flex-col transition-transform hover:scale-105 hover:shadow-2xl"
                >
                  {feed.resourceType === "image" && feed.fileUrl && (
                    <img
                      src={feed.fileUrl}
                      alt={feed.title}
                      className="w-full h-52 object-cover rounded-xl mb-3"
                    />
                  )}

                  {feed.resourceType === "video" && feed.fileUrl && (
                    <video
                      src={feed.fileUrl}
                      controls
                      className="w-full h-52 object-cover rounded-xl mb-3"
                    />
                  )}

                  {feed.resourceType === "raw" && feed.fileUrl && (
                    <div className="flex items-center justify-center h-48 bg-gray-100 mb-3 rounded-xl">
                      <button
                        onClick={() => handleDownloadPDF(feed.fileUrl, feed.title)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                      >
                        ⬇️ Download PDF
                      </button>
                    </div>
                  )}

                  <h4 className="font-bold text-gray-800 mb-1">{feed.title}</h4>
                  <p className="text-gray-600 flex-grow">{feed.description}</p>
                  <button
                    onClick={() => handleDeleteFeed(feed._id)}
                    className="mt-3 bg-gradient-to-r from-red-500 to-red-700 text-white py-2 rounded-xl shadow-md hover:from-red-600 hover:to-red-800 transition transform hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lost Items Section */}
      {activeTab === "lostItems" && (
        <div className="max-w-5xl mx-auto mb-12">
          {lostItems.length === 0 ? (
            <p className="text-gray-600 text-center">No lost items posted yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-2xl shadow-lg border border-purple-100 flex flex-col transition-transform hover:scale-105 hover:shadow-2xl"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-52 object-cover rounded-xl mb-3"
                    />
                  )}
                  <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                  <p className="text-gray-600 flex-grow">{item.description}</p>
                  <span
                    className={`font-semibold mb-2 ${
                      item.status === "lost" ? "text-red-500" : "text-green-500"
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
