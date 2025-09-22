import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold text-gray-900">
          CampusFeed
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-gray-700 hover:text-black transition">
            Feed
          </Link>

          {token ? (
            <>
              <Link
                to="/items"
                className="text-gray-700 hover:text-black transition"
              >
                Items
              </Link>
              <Link
                to="/AddFeed"
                className="text-gray-700 hover:text-black transition"
              >
                Add Feed
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 hover:text-black transition"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Burger button (mobile) */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          ☰
        </button>
      </div>

      {/* Mobile Nav */}
      {open && (
        <nav className="md:hidden flex flex-col gap-3 border-t bg-white px-4 py-3">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-black transition"
          >
            Feed
          </Link>

          {token ? (
            <>
              <Link
                to="/items"
                onClick={() => setOpen(false)}
                className="text-gray-700 hover:text-black transition"
              >
                Items
              </Link>
              <Link
                to="/AddFeed"
                onClick={() => setOpen(false)}
                className="text-gray-700 hover:text-black transition"
              >
                Add Feed
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="text-red-600 text-left hover:text-red-800 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-gray-700 hover:text-black transition"
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
