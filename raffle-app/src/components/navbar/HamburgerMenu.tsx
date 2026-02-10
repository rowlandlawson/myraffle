'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { X } from 'lucide-react';
import Image from 'next/image';

export default function HamburgerMenu({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 bg-white w-72 h-full shadow-2xl p-4 space-y-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={200}
              height={80}
              className="h-auto w-40 md:h-auto md:w-48 object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/items"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
              >
                Browse Items
              </Link>
              <Link
                href="/tickets"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
              >
                My Tickets
              </Link>
              <Link
                href="/wallet"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
              >
                Wallet
              </Link>
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
              >
                Account
              </Link>
              <hr className="my-4 border-gray-200" />
              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-md"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md mt-4"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
