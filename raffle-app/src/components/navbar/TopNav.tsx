'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

import { useAuthStore } from '@/lib/authStore';

export default function TopNav() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
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
            {!isAuthenticated ? (
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
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="font-medium hidden sm:block">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
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
