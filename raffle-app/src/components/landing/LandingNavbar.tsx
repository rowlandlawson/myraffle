'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="font-bold text-xl text-gray-900">RaffleHub</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#items"
            className="text-gray-600 hover:text-red-600 transition"
          >
            Items
          </a>
          <a
            href="#winners"
            className="text-gray-600 hover:text-red-600 transition"
          >
            Winners
          </a>
          <a
            href="#how"
            className="text-gray-600 hover:text-red-600 transition"
          >
            How it Works
          </a>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2 text-gray-900 font-semibold hover:text-red-600 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#items"
              className="block py-2 text-gray-700 hover:text-red-600 font-medium"
            >
              Items
            </a>
            <a
              href="#winners"
              className="block py-2 text-gray-700 hover:text-red-600 font-medium"
            >
              Winners
            </a>
            <a
              href="#how"
              className="block py-2 text-gray-700 hover:text-red-600 font-medium"
            >
              How it Works
            </a>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link
                href="/login"
                className="block w-full py-3 text-center text-gray-900 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
