import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Backend URL for local development
  const backendURL = "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${backendURL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("Something went wrong!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>

        <input
          className="w-full p-4 mb-4 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full p-4 mb-4 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-4 mb-4 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
          placeholder="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        {/* Password field with toggle */}
        <div className="relative mb-6">
          <input
            className="w-full p-4 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 pr-12"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-2xl text-white font-semibold shadow-lg transition transform hover:scale-105 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
