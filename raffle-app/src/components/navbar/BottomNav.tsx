'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Menu } from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from '@/components/navbar/HamburgerMenu';

export default function BottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60]">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center w-1/2 h-full gap-1 ${
              isActive('/dashboard') ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            <Home size={24} />
            <span className="text-xs">Home</span>
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center justify-center w-1/2 h-full gap-1 text-gray-600"
          >
            <Menu size={24} />
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </nav>

      {isMenuOpen && <HamburgerMenu onClose={() => setIsMenuOpen(false)} />}

      {/* Spacer for navbar */}
      <div className="h-16" />
    </>
  );
}
