'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Ticket,
  Award,
  Menu,
  X,
  LogOut,
  Settings,
  Wallet,
  HelpCircle,
  FileText,
  User,
  LayoutDashboard,
  Trophy,
  Users as UsersIcon,
  Image as ImageIcon,
  CreditCard,
  Receipt,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import TermsModal from '@/components/terms/TermsModal';
import HowItWorksModal from '@/components/landing/HowItWorksModal';

// Pages where the bottom nav should be completely hidden
const HIDDEN_PATHS = ['/login', '/register', '/forgot-password'];

export default function AppBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const isAdmin = isAuthenticated && (user as any)?.role === 'ADMIN';
  const isHidden = HIDDEN_PATHS.some((p) => pathname?.startsWith(p));
  const isAdminPage = pathname?.startsWith('/admin') || isAdmin;
  const isDashboardPage = pathname?.startsWith('/dashboard');

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/admin' || path === '/') return pathname === path;
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
      active ? 'text-[#C0000C]' : 'text-gray-500 hover:text-gray-800'
    }`;

  const labelClass = (active: boolean) =>
    `text-[10px] font-bold ${active ? 'text-[#C0000C]' : 'text-gray-500'}`;

  if (isHidden) return null;

  // ─── UNAUTHENTICATED ────────────────────────────────────────
  if (!isAuthenticated && !isAdminPage) {
    return (
      <>
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-2xl h-16 z-[60]">
          <div className="flex h-full max-w-xl mx-auto">
            <Link href="/" className={tabClass(isActive('/'))}>
              <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
              <span className={labelClass(isActive('/'))}>Home</span>
            </Link>
            <Link href="/login" className={tabClass(isActive('/login'))}>
              <User size={22} strokeWidth={isActive('/login') ? 2.5 : 1.8} />
              <span className={labelClass(isActive('/login'))}>Sign In</span>
            </Link>
          </div>
        </nav>
        <div className="h-16 md:hidden" />
      </>
    );
  }

  // ─── ADMIN ──────────────────────────────────────────────────
  if (isAdminPage) {
    const adminTabs = [
      { href: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
      { href: '/admin/raffles', icon: Ticket, label: 'Raffles' },
      { href: '/admin/wins', icon: Trophy, label: 'Wins' },
    ];

    return (
      <>
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-2xl h-16 z-[60]">
          <div className="flex h-full max-w-xl mx-auto">
            {adminTabs.map((tab) => {
              const active = tab.exact ? pathname === tab.href : isActive(tab.href);
              return (
                <Link key={tab.href} href={tab.href} className={tabClass(active)}>
                  <tab.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span className={labelClass(active)}>{tab.label}</span>
                </Link>
              );
            })}

            {/* More drawer */}
            <button onClick={() => setDrawerOpen(true)} className={tabClass(drawerOpen)}>
              <Menu size={22} strokeWidth={drawerOpen ? 2.5 : 1.8} />
              <span className={labelClass(drawerOpen)}>More</span>
            </button>
          </div>
        </nav>

        {/* Admin More Drawer */}
        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
            onClick={() => setDrawerOpen(false)}
          >
            <div
              className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto" />
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-black text-gray-900">Admin Panel</h3>
                  <p className="text-xs text-gray-400">{user?.name}</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: '/admin/users', icon: UsersIcon, label: 'Users', sub: 'Manage Accounts', color: 'bg-blue-100 text-blue-600' },
                  { href: '/admin/banners', icon: ImageIcon, label: 'Banners', sub: 'Promos & Slides', color: 'bg-emerald-100 text-emerald-600' },
                  { href: '/admin/analytics', icon: Trophy, label: 'Analytics', sub: 'Platform Stats', color: 'bg-amber-100 text-amber-600' },
                  { href: '/admin/transactions', icon: Receipt, label: 'Transactions', sub: 'Audit Logs', color: 'bg-purple-100 text-purple-600' },
                  { href: '/admin/tasks', icon: Zap, label: 'Tasks', sub: 'Earn Rules', color: 'bg-orange-100 text-orange-600' },
                  { href: '/admin/terms', icon: FileText, label: 'Terms', sub: 'Site Content', color: 'bg-teal-100 text-teal-600' },
                  { href: '/admin/settings', icon: Settings, label: 'Settings', sub: 'System Config', color: 'bg-indigo-100 text-indigo-600' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-2 rounded-xl ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-400">{item.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={() => { setDrawerOpen(false); logout(); router.push('/'); }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold text-sm bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-16 md:hidden" />
      </>
    );
  }

  // ─── AUTHENTICATED USER (dashboard + all other pages) ───────
  const userTabs = [
    { href: '/dashboard', icon: Home, label: 'Home', exact: true },
    { href: '/dashboard/tickets', icon: Ticket, label: 'Tickets' },
    { href: '/dashboard/earnings', icon: Award, label: 'Earnings' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-2xl h-16 z-[60]">
        <div className="flex h-full max-w-xl mx-auto">
          {userTabs.map((tab) => {
            const active = tab.exact ? pathname === tab.href : isActive(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={tabClass(active)}>
                <tab.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={labelClass(active)}>{tab.label}</span>
              </Link>
            );
          })}

          {/* More drawer button */}
          <button onClick={() => setDrawerOpen(true)} className={tabClass(drawerOpen)}>
            {drawerOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={1.8} />}
            <span className={labelClass(drawerOpen)}>More</span>
          </button>
        </div>
      </nav>

      {/* User More Drawer */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto" />

            {/* User card */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 bg-[#C0000C] rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 font-mono">{user?.userNumber}</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet', sub: 'Balance & Funds', color: 'bg-emerald-100 text-emerald-600' },
                { href: '/dashboard/settings', icon: Settings, label: 'Settings', sub: 'Profile & Security', color: 'bg-blue-100 text-blue-600' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-xl ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">{item.label}</div>
                    <div className="text-[10px] text-gray-400">{item.sub}</div>
                  </div>
                </Link>
              ))}

              <button
                onClick={() => { setDrawerOpen(false); setHowItWorksOpen(true); }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600"><HelpCircle size={18} /></div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">How it Works</div>
                  <div className="text-[10px] text-gray-400">Raffle guide</div>
                </div>
              </button>

              <button
                onClick={() => { setDrawerOpen(false); setTermsOpen(true); }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="p-2 rounded-xl bg-purple-100 text-purple-600"><FileText size={18} /></div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">Terms</div>
                  <div className="text-[10px] text-gray-400">Policy & Rules</div>
                </div>
              </button>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => { setDrawerOpen(false); logout(); router.push('/'); }}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold text-sm bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} /> Sign Out ({user?.userNumber || 'Account'})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />

      <div className="h-16 md:hidden" />
    </>
  );
}
