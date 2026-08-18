'use client';

import HowItWorksModal from '@/components/landing/HowItWorksModal';
import TermsModal from '@/components/terms/TermsModal';
import { useAuthStore } from '@/lib/authStore';
import {
  Award,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Ticket,
  Trophy,
  User,
  Users as UsersIcon,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const _router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const isAdminPath = pathname?.startsWith('/admin');

  const isActive = (path: string) => {
    if (path === '/' || path === '/admin' || path === '/dashboard') {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(path);
  };

  // 1. PUBLIC UNAUTHENTICATED NAVIGATION
  if (!isAuthenticated && !isAdminPath) {
    return (
      <>
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl h-16"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
          }}
        >
          <div className="flex justify-around items-center h-full max-w-xl mx-auto px-6 gap-4">
            {/* Home */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive('/') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
              <span
                className={`text-[11px] font-bold ${isActive('/') ? 'text-red-600' : 'text-gray-600'}`}
              >
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
              <span
                className={`text-[11px] font-bold ${isActive('/login') ? 'text-red-600' : 'text-gray-600'}`}
              >
                Sign In
              </span>
            </Link>
          </div>
        </nav>
        <div className="h-16 md:hidden" />
      </>
    );
  }

  // 2. ADMIN MOBILE NAVIGATION
  if (isAdminPath) {
    return (
      <>
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl h-16"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
          }}
        >
          <div className="flex justify-around items-center h-full max-w-xl mx-auto px-2">
            {/* Admin Overview */}
            <Link
              href="/admin"
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                pathname === '/admin' ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={20} strokeWidth={pathname === '/admin' ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold">Overview</span>
            </Link>

            {/* Admin Raffles */}
            <Link
              href="/admin/raffles"
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive('/admin/raffles') ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Ticket size={20} strokeWidth={isActive('/admin/raffles') ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold">Raffles</span>
            </Link>

            {/* Admin Wins */}
            <Link
              href="/admin/wins"
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive('/admin/wins') ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Trophy size={20} strokeWidth={isActive('/admin/wins') ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold">Wins</span>
            </Link>

            {/* Admin More Drawer */}
            <button
              onClick={() => setMoreDrawerOpen(!moreDrawerOpen)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                moreDrawerOpen ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {moreDrawerOpen ? (
                <X size={20} strokeWidth={2.5} />
              ) : (
                <Menu size={20} strokeWidth={1.8} />
              )}
              <span className="text-[10px] font-bold">More</span>
            </button>
          </div>
        </nav>

        {/* Unified Native Mobile Drawer Modal for Admin */}
        {moreDrawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end"
            onClick={() => setMoreDrawerOpen(false)}
          >
            <div
              className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Admin Control Panel</h3>
                  <p className="text-xs text-gray-500">Super Admin Quick Navigation</p>
                </div>
                <button
                  onClick={() => setMoreDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Admin Menu Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/admin/users"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100"
                >
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Users</div>
                    <div className="text-[10px] text-gray-500">Manage Accounts</div>
                  </div>
                </Link>

                <Link
                  href="/admin/banners"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100"
                >
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Banners</div>
                    <div className="text-[10px] text-gray-500">Promos & Slides</div>
                  </div>
                </Link>

                <Link
                  href="/admin/payouts"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100"
                >
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Payouts</div>
                    <div className="text-[10px] text-gray-500">Withdrawal Claims</div>
                  </div>
                </Link>

                <Link
                  href="/admin/transactions"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100"
                >
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Transactions</div>
                    <div className="text-[10px] text-gray-500">Audit Payment Logs</div>
                  </div>
                </Link>

                <Link
                  href="/admin/tasks"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100"
                >
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Tasks</div>
                    <div className="text-[10px] text-gray-500">Earn Rules</div>
                  </div>
                </Link>

                <Link
                  href="/admin/terms"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100"
                >
                  <div className="p-2 bg-teal-100 text-teal-600 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Terms Edit</div>
                    <div className="text-[10px] text-gray-500">Site Content</div>
                  </div>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition border border-slate-100"
                >
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Settings size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Settings</div>
                    <div className="text-[10px] text-gray-500">System Config</div>
                  </div>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 text-red-600 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition border border-red-100"
                >
                  <LogOut size={18} />
                  <span>Sign Out ({user?.name || 'Admin'})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-16 md:hidden" />
      </>
    );
  }

  // 3. USER DASHBOARD MOBILE NAVIGATION
  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl h-16"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999 }}
      >
        <div className="flex justify-around items-center h-full max-w-xl mx-auto px-2">
          {/* Home Button */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive('/dashboard') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Home size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 1.8} />
            <span
              className={`text-[11px] font-bold ${
                isActive('/dashboard') ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              Home
            </span>
          </Link>

          {/* Tickets Button */}
          <Link
            href="/dashboard/tickets"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive('/dashboard/tickets') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Ticket size={22} strokeWidth={isActive('/dashboard/tickets') ? 2.5 : 1.8} />
            <span
              className={`text-[11px] font-bold ${
                isActive('/dashboard/tickets') ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              Tickets
            </span>
          </Link>

          {/* Earnings Button */}
          <Link
            href="/dashboard/earnings"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive('/dashboard/earnings') ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Award size={22} strokeWidth={isActive('/dashboard/earnings') ? 2.5 : 1.8} />
            <span
              className={`text-[11px] font-bold ${
                isActive('/dashboard/earnings') ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              Earnings
            </span>
          </Link>

          {/* More Button */}
          <button
            onClick={() => setMoreDrawerOpen(!moreDrawerOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              moreDrawerOpen ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {moreDrawerOpen ? (
              <X size={22} strokeWidth={2.5} />
            ) : (
              <Menu size={22} strokeWidth={1.8} />
            )}
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

      {/* Unified Native Mobile Drawer Modal for User Dashboard */}
      {moreDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end"
          onClick={() => setMoreDrawerOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Menu & Options</h3>
                <p className="text-xs text-gray-500">Account Management & Help</p>
              </div>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Menu Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/dashboard/earnings"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
              >
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
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
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
              >
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Settings size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">Settings</div>
                  <div className="text-[10px] text-gray-500">Profile & Security</div>
                </div>
              </Link>

              <button
                onClick={() => {
                  setMoreDrawerOpen(false);
                  setHowItWorksOpen(true);
                }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition text-left"
              >
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
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
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition text-left"
              >
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">Terms</div>
                  <div className="text-[10px] text-gray-500">Conditions & Rules</div>
                </div>
              </button>
            </div>

            {/* Sign Out */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setMoreDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3.5 text-red-600 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition border border-red-100"
              >
                <LogOut size={18} />
                <span>Sign Out ({user?.userNumber || 'Account'})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals triggered from drawer */}
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />

      {/* Bottom Spacer */}
      <div className="h-16 md:hidden" />
    </>
  );
}
