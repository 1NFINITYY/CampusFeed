import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
          <Link to="/items" className="text-gray-700 hover:text-black transition">
            Items
          </Link>
          <Link to="/AddFeed" className="text-gray-700 hover:text-black transition">
            Add Feed
          </Link>
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
          <Link
            to="/items"
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-black transition"
          >
            Items
          </Link>
          <Link
            to="/jobs"
            onClick={() => setOpen(false)}
            className="text-gray-700 hover:text-black transition"
          >
            Add Posts
          </Link>
        </nav>
      )}
    </header>
  );
}
