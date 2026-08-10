'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Menu, X, Award, Settings, LogOut, FileText, HelpCircle, User } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import TermsModal from '@/components/terms/TermsModal';
import HowItWorksModal from '@/components/landing/HowItWorksModal';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path);
  };

  // If user is not logged in, show only public bottom nav (Home, Sign In, Get Started)
  if (!isAuthenticated) {
    return (
      <>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-[60] shadow-xl h-16">
          <div className="flex justify-around items-center h-full max-w-xl mx-auto px-4 gap-2">
            {/* Home */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive('/') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
              <span className={`text-[11px] font-bold ${isActive('/') ? 'text-red-600' : 'text-gray-600'}`}>
                Home
              </span>
            </Link>

            {/* Sign In */}
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive('/login') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <User size={22} strokeWidth={isActive('/login') ? 2.5 : 1.8} />
              <span className={`text-[11px] font-bold ${isActive('/login') ? 'text-red-600' : 'text-gray-600'}`}>
                Sign In
              </span>
            </Link>

            {/* Get Started */}
            <Link
              href="/register"
              className="flex items-center justify-center flex-1 h-full"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center w-full">
                Get Started
              </div>
            </Link>
          </div>
        </nav>
        <div className="h-16 md:hidden" />
      </>
    );
  }

  return (
    <>
      {/* Fixed Mobile Bottom Navigation Bar for Logged-In Users */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60] shadow-xl h-16">
        <div className="flex justify-around items-center h-full max-w-xl mx-auto px-2">
          {/* 1. Home Button */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive('/dashboard') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Home
              size={22}
              strokeWidth={isActive('/dashboard') ? 2.5 : 1.8}
            />
            <span
              className={`text-[11px] font-bold ${
                isActive('/dashboard') ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              Home
            </span>
          </Link>

          {/* 2. Tickets Button */}
          <Link
            href="/dashboard/tickets"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive('/dashboard/tickets') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Ticket
              size={22}
              strokeWidth={isActive('/dashboard/tickets') ? 2.5 : 1.8}
            />
            <span
              className={`text-[11px] font-bold ${
                isActive('/dashboard/tickets') ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              Tickets
            </span>
          </Link>

          {/* 3. Earnings Button */}
          <Link
            href="/dashboard/earnings"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive('/dashboard/earnings') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Award
              size={22}
              strokeWidth={isActive('/dashboard/earnings') ? 2.5 : 1.8}
            />
            <span
              className={`text-[11px] font-bold ${
                isActive('/dashboard/earnings') ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              Earnings
            </span>
          </Link>

          {/* 4. More Button */}
          <button
            onClick={() => setMoreDrawerOpen(!moreDrawerOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              moreDrawerOpen ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {moreDrawerOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={1.8} />}
            <span
              className={`text-[11px] font-bold ${
                moreDrawerOpen ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Mobile More Drawer */}
      {moreDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-end">
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 text-lg">Menu & Options</span>
              </div>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard/earnings"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">Earnings</div>
                      <div className="text-[10px] text-gray-500">Tasks & Points</div>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Settings size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">Settings</div>
                      <div className="text-[10px] text-gray-500">Profile & Security</div>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs justify-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMoreDrawerOpen(false)}
                    className="flex items-center gap-3 p-3 bg-red-600 text-white rounded-xl font-bold text-xs justify-center"
                  >
                    Get Started
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMoreDrawerOpen(false);
                  setHowItWorksOpen(true);
                }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left"
              >
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">How it Works</div>
                  <div className="text-[10px] text-gray-500">Raffle guide</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMoreDrawerOpen(false);
                  setTermsModalOpen(true);
                }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left"
              >
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">Terms</div>
                  <div className="text-[10px] text-gray-500">Conditions & Rules</div>
                </div>
              </button>
            </div>

            {isAuthenticated && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-600 font-bold text-sm bg-red-50 rounded-xl hover:bg-red-100 transition"
                >
                  <LogOut size={18} />
                  <span>Sign Out ({user?.userNumber || 'Account'})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals triggered from drawer */}
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />

      {/* Bottom Spacer for fixed navbar */}
      <div className="h-16 md:hidden" />
    </>
  );
}
