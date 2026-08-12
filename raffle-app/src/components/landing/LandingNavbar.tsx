'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, LogOut, Wallet } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#C0000C] rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm leading-none">M</span>
          </div>
          <span className="font-black text-xl text-gray-900 tracking-tight">
            my<span className="text-[#C0000C]">Raffle</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '#items', label: 'Live Raffles' },
            { href: '#winners', label: 'Winners' },
            { href: '#how', label: 'How It Works' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/earnings"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors text-sm"
              >
                <Wallet size={14} />
                ₦{(user?.walletBalance ?? 1000).toLocaleString()}
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
              >
                <User size={14} />
                {user?.name?.split(' ')[0] || user?.userNumber || 'Account'}
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-bold bg-[#C0000C] text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-5 py-4 space-y-1">
            {[
              { href: '#items', label: 'Live Raffles' },
              { href: '#winners', label: 'Winners' },
              { href: '#how', label: 'How It Works' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block w-full py-2.5 text-center text-sm font-bold bg-[#C0000C] text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="block w-full py-2.5 text-center text-sm font-semibold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block w-full py-2.5 text-center text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full py-2.5 text-center text-sm font-bold bg-[#C0000C] text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
