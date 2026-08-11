'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, FileText, HelpCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { useCartStore } from '@/lib/cartStore';
import HamburgerMenu from '@/components/navbar/HamburgerMenu';
import TermsModal from '@/components/terms/TermsModal';
import HowItWorksModal from '@/components/landing/HowItWorksModal';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openCart, getCartCount } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const cartCount = getCartCount();
  const isHomePage = pathname === '/';

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Back Button with Arrow Icon in TopNav */}
            {!isHomePage && (
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all border border-gray-200"
                aria-label="Go Back"
                title="Go Back"
              >
                <ArrowLeft size={20} strokeWidth={2} />
              </button>
            )}

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
          </div>

          {/* Mobile Header Right Icons */}
          <div className="flex items-center gap-2 z-10">
            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all shadow-sm border border-red-200 relative"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {cartCount}
                </span>
              )}
            </button>

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
