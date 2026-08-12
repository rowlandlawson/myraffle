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
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Lock,
  Trophy,
  Award,
  HelpCircle,
  FileText,
} from 'lucide-react';
import TermsModal from '@/components/terms/TermsModal';
import HowItWorksModal from '@/components/landing/HowItWorksModal';

const USER_MENU = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
  { label: 'Earnings', href: '/dashboard/earnings', icon: Award },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative font-sans text-slate-900 selection:bg-red-500 selection:text-white">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out shadow-sm
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

        {/* Desktop Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
          {USER_MENU.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border ${
                  isActive
                    ? 'bg-red-50/80 text-red-700 border-red-100/50 shadow-sm relative overflow-hidden'
                    : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />}
                <div className="relative shrink-0">
                  <item.icon
                    size={sidebarOpen ? 20 : 22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-red-600 relative z-10' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}
                  />
                </div>
                <span className={`font-semibold tracking-wide text-sm whitespace-nowrap transition-all duration-300 relative z-10 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50/80 border border-transparent transition-all ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
            title={!sidebarOpen ? 'Sign Out' : undefined}
          >
            <LogOut size={20} strokeWidth={2} className="shrink-0" />
            <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
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
        {/* Top Navbar (Desktop) */}
        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-5">
            {/* Wallet Balance Badge */}
            <a
              href="/dashboard/earnings"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-full border border-emerald-200/80 hover:bg-emerald-100 transition shadow-2xs"
            >
              <Wallet size={16} className="text-emerald-600" />
              <span className="text-sm">₦{(user?.walletBalance ?? 1000).toLocaleString()}</span>
            </a>

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
        <div className="pt-4 md:pt-0 p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 relative z-10 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      {/* Global Modals */}
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />

      {/* Global styles for custom scrollbar */}
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
