'use client';

import HowItWorksModal from '@/components/landing/HowItWorksModal';
import TermsModal from '@/components/terms/TermsModal';
import { useAuthStore } from '@/lib/authStore';
import { useCartStore } from '@/lib/cartStore';
import {
  ArrowLeft,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  Wallet,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Pages where the header should be hidden entirely (auth pages & admin dashboard layout)
const HIDDEN_PATHS = ['/login', '/register', '/forgot-password', '/admin'];
// Pages where only the logo is shown (auth sub-pages)
const AUTH_PATHS = ['/login', '/register'];

const LANDING_NAV_LINKS = [
  { href: '#items', label: 'Live Raffles' },
  { href: '#winners', label: 'Winners' },
  { href: '#how', label: 'How It Works' },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openCart, getCartCount } = useCartStore();

  const [termsOpen, setTermsOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cart count comes from localStorage (zustand persist) — only safe on client
  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? getCartCount() : 0;
  const _isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));
  const isHidden = HIDDEN_PATHS.some((p) => pathname?.startsWith(p));
  const isAdminPage = pathname?.startsWith('/admin');
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const isHomePage = pathname === '/';

  // Don't render on auth pages at all
  if (isHidden) return null;

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  // Which nav links to show on desktop (only show landing nav links when unauthenticated)
  const desktopNavLinks = isAuthenticated ? [] : LANDING_NAV_LINKS;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const Logo = (
    <Link
      href={isAdmin ? '/admin' : isAuthenticated ? '/dashboard' : '/'}
      className="flex items-center"
    >
      <img
        src="/images/icon-192.png"
        alt="myRaffle"
        className="xs:hidden h-8 w-8 object-contain rounded-lg shadow-xs"
      />
      <img
        src="/images/logo.png"
        alt="myRaffle"
        className="hidden xs:block h-10 md:h-14 lg:h-16 w-auto object-contain transition-all"
      />
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        {/* ── MOBILE HEADER ──────────────────────────────────── */}
        <div className="md:hidden flex items-center justify-between px-4 h-12">
          {/* Left: back button (non-home pages) or Logo */}
          <div className="flex items-center gap-2">
            {!isHomePage && !isDashboardPage && !isAdminPage && (
              <button
                onClick={() => router.back()}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Go Back"
              >
                <ArrowLeft size={16} className="text-gray-700" />
              </button>
            )}
            {Logo}
          </div>

          {/* Right: context-aware actions */}
          <div className="flex items-center gap-1.5">
            {/* Cart — regular users & visitors only (not admin) */}
            {!isAdmin && (
              <button
                onClick={openCart}
                className="relative w-8 h-8 bg-red-50 border border-red-100 text-[#E10600] rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E10600] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Wallet — authenticated regular users only */}
            {isAuthenticated && !isAdmin && (
              <Link
                href="/dashboard/earnings"
                className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold hover:bg-emerald-100 transition-colors"
              >
                <Wallet size={11} />₦{(user?.walletBalance ?? 0).toLocaleString()}
              </Link>
            )}

            {/* Help — unauthenticated only */}
            {!isAuthenticated && (
              <button
                onClick={() => setHowItWorksOpen(true)}
                className="w-8 h-8 bg-amber-50 border border-amber-100 text-amber-700 rounded-full flex items-center justify-center hover:bg-amber-100 transition-colors"
                aria-label="How It Works"
              >
                <HelpCircle size={16} />
              </button>
            )}

            {/* Terms */}
            <button
              onClick={() => setTermsOpen(true)}
              className="w-8 h-8 bg-gray-50 border border-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Terms"
            >
              <FileText size={16} />
            </button>
          </div>
        </div>

        {/* ── DESKTOP HEADER ─────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-between px-6 lg:px-8 h-14 max-w-[1600px] mx-auto">
          {/* Left: Logo */}
          <div className="flex items-center gap-8">
            {Logo}

            {/* Desktop nav links */}
            {desktopNavLinks.length > 0 && (
              <nav className="flex items-center gap-1">
                {desktopNavLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== '/' && pathname?.startsWith(link.href));
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'text-[#E10600] bg-red-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right: Auth actions */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                {/* Cart — non-admin only */}
                {!isAdmin && (
                  <button
                    onClick={openCart}
                    className="relative w-9 h-9 bg-red-50 border border-red-100 text-[#E10600] rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <ShoppingBag size={17} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E10600] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Wallet — non-admin only */}
                {!isAdmin && (
                  <Link
                    href="/dashboard/earnings"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors text-sm"
                  >
                    <Wallet size={14} />₦{(user?.walletBalance ?? 0).toLocaleString()}
                  </Link>
                )}

                {/* Admin badge */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors text-sm"
                  >
                    <LayoutDashboard size={14} />
                    Admin
                  </Link>
                )}

                {/* User avatar + name */}
                <div className="relative">
                  <button
                    onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-6 h-6 bg-[#E10600] rounded-full flex items-center justify-center text-white text-xs font-black">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0] || user?.userNumber || 'Account'}
                    </span>
                    {desktopMenuOpen ? (
                      <X size={14} className="text-gray-500" />
                    ) : (
                      <Menu size={14} className="text-gray-500" />
                    )}
                  </button>

                  {/* Dropdown */}
                  {desktopMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50"
                      onMouseLeave={() => setDesktopMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{user?.userNumber}</p>
                      </div>
                      <div className="py-1">
                        {isAdmin ? (
                          <>
                            <Link
                              href="/admin"
                              onClick={() => setDesktopMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Admin Dashboard
                            </Link>
                            <Link
                              href="/admin/items"
                              onClick={() => setDesktopMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Raffle Items
                            </Link>
                            <Link
                              href="/admin/users"
                              onClick={() => setDesktopMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Manage Users
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/dashboard"
                              onClick={() => setDesktopMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Dashboard
                            </Link>
                            <Link
                              href="/dashboard/tickets"
                              onClick={() => setDesktopMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              My Tickets
                            </Link>
                            <Link
                              href="/dashboard/settings"
                              onClick={() => setDesktopMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Settings
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="border-t border-gray-50 py-1">
                        <button
                          onClick={() => {
                            handleLogout();
                            setDesktopMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated desktop */}
                {!isAdminPage && !isDashboardPage && (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-bold bg-[#E10600] text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </>
  );
}
