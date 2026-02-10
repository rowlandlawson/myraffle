'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

// TODO: Re-enable when NextAuth is set up
// import { useSession, signOut } from "next-auth/react";

export default function TopNav() {
  // TODO: Replace with useSession() when NextAuth is configured
  const session = null; // Mock: no session until NextAuth is set up
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    // TODO: Replace with signOut() from next-auth when configured
    localStorage.removeItem('user_session');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={200}
              height={80}
              className="h-auto w-40 md:h-auto md:w-48 object-contain"
            />
          </Link>

          {/* Auth Links */}
          <div className="flex items-center gap-4">
            {!session ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-red-600 font-medium px-2 py-1 text-xs md:text-base md:px-3 md:py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-3 py-1.5 text-xs md:text-base md:px-5 md:py-2 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded transition-colors"
                >
                  <Menu size={24} />
                  <span className="font-medium">User</span>
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
