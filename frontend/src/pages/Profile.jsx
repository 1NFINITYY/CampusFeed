import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const backendURL = "http://localhost:5000";

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

  if (!profile) return <p className="text-center mt-10">Loading...</p>;

  const { user, feeds, lostItems } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* User Info */}
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl mb-10 border border-pink-200 text-center">
        <img
          src={user.profilePic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h2 className="text-3xl font-bold mb-2">{user.username}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-600">📞 {user.phone}</p>
      </div>

      {/* User Feeds */}
      <div className="max-w-4xl mx-auto mb-10">
        <h3 className="text-2xl font-semibold mb-6 text-gray-700">My Feeds</h3>
        {feeds.length === 0 ? (
          <p className="text-gray-600">No feeds posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeds.map((feed) => (
              <div key={feed._id} className="bg-white p-4 rounded-2xl shadow-md border border-pink-200">
                {feed.fileUrl && (
                  <img
                    src={feed.fileUrl}
                    alt={feed.title}
                    className="w-full h-48 object-cover rounded-xl mb-3"
                  />
                )}
                <h4 className="font-bold text-gray-800">{feed.title}</h4>
                <p className="text-gray-600">{feed.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Lost Items */}
      <div className="max-w-4xl mx-auto mb-10">
        <h3 className="text-2xl font-semibold mb-6 text-gray-700">My Lost Items</h3>
        {lostItems.length === 0 ? (
          <p className="text-gray-600">No lost items posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostItems.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-2xl shadow-md border border-pink-200">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-xl mb-3"
                  />
                )}
                <h4 className="font-bold text-gray-800">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
                <span className={`font-semibold ${item.status === "lost" ? "text-red-500" : "text-green-500"}`}>
                  Status: {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
