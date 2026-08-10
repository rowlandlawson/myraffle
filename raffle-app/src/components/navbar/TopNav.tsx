'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, FileText, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import HamburgerMenu from '@/components/navbar/HamburgerMenu';
import TermsModal from '@/components/terms/TermsModal';
import HowItWorksModal from '@/components/landing/HowItWorksModal';

export default function TopNav() {
  const { isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Brand Logo - Bigger on mobile */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Raffle Logo"
              width={220}
              height={70}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Mobile Header Right Icons */}
          <div className="flex items-center gap-2 z-10">
            {/* How It Works Help Icon */}
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center hover:bg-amber-100 active:scale-95 transition-all shadow-sm border border-amber-200"
              aria-label="How It Works"
              title="How It Works"
            >
              <HelpCircle size={20} />
            </button>

            {/* Terms & Conditions Paper Icon */}
            <button
              onClick={() => setTermsModalOpen(true)}
              className="w-10 h-10 rounded-full bg-gray-50 text-gray-700 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all shadow-sm border border-gray-200"
              aria-label="Terms & Conditions"
              title="Terms & Conditions"
            >
              <FileText size={20} />
            </button>

            {/* User Account Icon - Opens Hamburger Menu / Auth */}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all shadow-sm border border-red-200"
              aria-label="Account Menu"
              title="Account Menu"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Hamburger Navigation Menu when user icon is tapped */}
      {menuOpen && <HamburgerMenu onClose={() => setMenuOpen(false)} />}

      {/* Terms & Conditions Modal */}
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />

      {/* How It Works Bottom Sheet Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </>
  );
}
