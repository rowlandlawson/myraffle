'use client';

import { useAuthStore } from '@/lib/authStore';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Ticket,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import type { ComponentType } from 'react';

interface NavSingleItem {
  type?: 'single';
  label: string;
  href: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
}

interface NavGroupItem {
  type: 'group';
  label: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
  items: {
    label: string;
    href: string;
    icon: ComponentType<{
      size?: number;
      className?: string;
      strokeWidth?: number;
    }>;
  }[];
}

type NavItem = NavSingleItem | NavGroupItem;

const ADMIN_MENU: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  {
    type: 'group',
    label: 'Raffles & Wins',
    icon: Ticket,
    items: [
      { label: 'Raffles', href: '/admin/raffles', icon: Ticket },
      { label: 'Wins & Claims', href: '/admin/wins', icon: Trophy },
      { label: 'Transactions', href: '/admin/transactions', icon: Receipt },
    ],
  },
  { label: 'Tasks', href: '/admin/tasks', icon: Zap },
  {
    type: 'group',
    label: 'Settings',
    icon: Settings,
    items: [
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Terms & Conditions', href: '/admin/terms', icon: FileText },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-expand group containing active route
  useEffect(() => {
    for (const item of ADMIN_MENU) {
      if (item.type === 'group') {
        const isChildActive = item.items.some((child) => pathname === child.href);
        if (isChildActive) {
          setOpenGroups((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Prevent flashing unauthenticated content
  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-slate-300 border-t-red-600 rounded-full mb-4" />
        <p className="text-slate-500 font-medium tracking-wide">Authenticating Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 py-2 fixed top-0 left-0 right-0 z-50 shadow-sm h-14">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="RaffleHub"
            width={100}
            height={28}
            className="object-contain"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded shadow-sm">
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-sm
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 relative'}`}
          >
            <Image
              src="/images/logo.png"
              alt="RaffleHub"
              width={140}
              height={36}
              className="object-contain"
            />
            {sidebarOpen && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded absolute right-4 top-4">
                Admin
              </span>
            )}
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
        <div
          className={`p-4 border-b border-slate-100 transition-all ${sidebarOpen ? 'block' : 'hidden'}`}
        >
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 font-medium">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
          {ADMIN_MENU.map((item) => {
            if (item.type === 'group') {
              const isGroupOpen = openGroups[item.label] ?? false;
              const isChildActive = item.items.some((child) => pathname === child.href);

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border ${
                      isChildActive
                        ? 'bg-slate-100/80 text-slate-900 border-slate-200 font-bold'
                        : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                    } ${sidebarOpen ? 'justify-between' : 'justify-center'}`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={sidebarOpen ? 20 : 22}
                        className={
                          isChildActive
                            ? 'text-red-600 shrink-0'
                            : 'text-slate-400 group-hover:text-slate-600 shrink-0'
                        }
                      />
                      <span
                        className={`font-semibold tracking-wide text-sm whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 ${isGroupOpen ? 'rotate-180 text-slate-600' : ''}`}
                      />
                    )}
                  </button>

                  {/* Sub-menu items */}
                  {isGroupOpen && (
                    <div className={`space-y-1 ${sidebarOpen ? 'pl-4' : 'pl-0'}`}>
                      {item.items.map((subItem) => {
                        const isActive = pathname === subItem.href;
                        return (
                          <a
                            key={subItem.href}
                            href={subItem.href}
                            className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 border text-xs ${
                              isActive
                                ? 'bg-red-50/80 text-red-700 border-red-100/50 font-bold relative overflow-hidden'
                                : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                            } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                            title={!sidebarOpen ? subItem.label : undefined}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />
                            )}
                            <subItem.icon
                              size={16}
                              className={
                                isActive
                                  ? 'text-red-600 shrink-0 relative z-10'
                                  : 'text-slate-400 group-hover:text-slate-600 shrink-0'
                              }
                            />
                            <span
                              className={`font-semibold tracking-wide text-xs whitespace-nowrap transition-all duration-300 relative z-10 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}
                            >
                              {subItem.label}
                            </span>
                            {isActive && sidebarOpen && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 shadow-sm relative z-10" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular Single Item
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border ${
                  isActive
                    ? 'bg-red-50/80 text-red-700 border-red-100/50 shadow-sm relative overflow-hidden'
                    : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />
                )}
                <item.icon
                  size={sidebarOpen ? 20 : 22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={
                    isActive
                      ? 'text-red-600 shrink-0 relative z-10'
                      : 'text-slate-400 group-hover:text-slate-600 transition-colors shrink-0'
                  }
                />
                <span
                  className={`font-semibold tracking-wide text-sm whitespace-nowrap transition-all duration-300 relative z-10 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}
                >
                  {item.label}
                </span>
                {isActive && sidebarOpen && (
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
            <span
              className={`font-semibold tracking-wide text-sm transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}
            >
              Sign Out
            </span>
          </button>
        </div>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute -right-3.5 top-24 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 p-1.5 rounded-full shadow-sm z-50 transition-all"
        >
          {sidebarOpen ? (
            <ChevronLeft size={14} strokeWidth={3} />
          ) : (
            <ChevronRight size={14} strokeWidth={3} />
          )}
        </button>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
      >
        {/* Page Content */}
        <div className="p-4 sm:p-6 md:p-10 pt-20 md:pt-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 relative z-10">
          {children}
        </div>
      </main>

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
