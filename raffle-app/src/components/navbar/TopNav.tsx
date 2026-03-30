'use client';

import Link from 'next/link';
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
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={180}
              height={60}
              className="h-auto w-32 sm:w-40 object-contain"
              priority
            />
          </Link>

          {/* Auth Links */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-red-600 font-semibold px-3 py-2 text-sm transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-5 py-2 text-sm rounded-full font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/20 hover:shadow-lg active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 px-2 py-1.5 rounded-xl transition-colors"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-red-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-500 text-white flex items-center justify-center font-bold text-sm ring-2 ring-red-100">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="font-semibold text-sm hidden sm:block">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Account
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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

