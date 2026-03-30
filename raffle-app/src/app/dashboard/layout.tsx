'use client';

import { useState, ReactNode, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';
import {
  Home,
  Wallet,
  Ticket,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Lock,
  Trophy,
} from 'lucide-react';

const USER_MENU = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Items', href: '/dashboard/items', icon: ShoppingBag },
  { label: 'Wallet', href: '#', icon: Wallet, locked: true },
  { label: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
  { label: 'Earnings', href: '/dashboard/earnings', icon: Star },
  { label: 'My Wins', href: '/dashboard/wins', icon: Trophy },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Prevent unauthenticated flashes while redirecting
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-slate-300 border-t-red-600 rounded-full mb-4"></div>
        <p className="text-slate-500 font-medium tracking-wide">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 flex items-center justify-between p-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="RaffleHub"
            width={120}
            height={32}
            className="object-contain"
          />
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-sm
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 relative'}`}>
            <Image
              src="/images/logo.png"
              alt="RaffleHub"
              width={140}
              height={36}
              className="object-contain"
            />
          </div>
          {/* Collapse icon for non-expanded view */}
          {!sidebarOpen && (
            <div className="w-full flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="object-cover w-9 h-9 rounded-lg border border-slate-100 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* User Card */}
        <div className={`p-4 border-b border-slate-100 transition-all ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 font-medium font-mono">{user?.userNumber || 'Member'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
          {USER_MENU.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.label}
                href={item.locked ? '#' : item.href}
                onClick={(e) => {
                  if (item.locked) {
                    e.preventDefault();
                    toast.error('Wallet is currently locked');
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border ${isActive
                  ? 'bg-red-50/80 text-red-700 border-red-100/50 shadow-sm relative overflow-hidden'
                  : item.locked
                    ? 'text-slate-400 border-transparent opacity-50 cursor-not-allowed'
                    : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />}
                <div className="relative shrink-0">
                  <item.icon
                    size={sidebarOpen ? 20 : 22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-red-600 relative z-10' : item.locked ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}
                  />
                  {item.locked && (
                    <Lock
                      size={10}
                      className="absolute -bottom-0.5 -right-0.5 text-slate-400"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <span className={`font-semibold tracking-wide text-sm whitespace-nowrap transition-all duration-300 relative z-10 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                  {item.label}
                </span>
                {item.locked && sidebarOpen && (
                  <Lock size={12} className="ml-auto text-slate-400" />
                )}
                {isActive && sidebarOpen && !item.locked && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 shadow-sm relative z-10" />
                )}
              </a>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut size={20} />
            <span className={`font-semibold tracking-wide text-sm transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              Sign Out
            </span>
          </button>
        </div>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute -right-3.5 top-24 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 p-1.5 rounded-full shadow-sm z-50 transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Top Navbar */}
        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
              <p className="text-xs font-semibold text-slate-500 tracking-wide">{user?.userNumber}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-md border-2 border-white ring-2 ring-slate-100">
              <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-[64px] md:pt-0 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 relative z-10 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg z-50">
        <div className="flex justify-around items-center">
          {USER_MENU.filter(item => item.label !== 'Settings').map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2.5 transition-colors ${isActive ? 'text-red-600' : 'text-slate-500 hover:text-red-600'}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'text-red-600' : 'text-slate-500'}`}>{item.label}</span>
                {isActive && <div className="absolute bottom-0 w-8 h-0.5 bg-red-600 rounded-full" />}
              </a>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 py-2.5 transition-colors ${mobileMenuOpen ? 'text-red-600' : 'text-slate-500 hover:text-red-600'}`}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="text-[10px] mt-0.5 font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* Global styles for custom scrollbar in sidebar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
