'use client';

import { useState, ReactNode, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import {
    LayoutDashboard,
    Users,
    Ticket,
    Receipt,
    CreditCard,
    Zap,
    Settings,
    BarChart3,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Trophy,
} from 'lucide-react';

const ADMIN_MENU = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Raffles', href: '/admin/raffles', icon: Ticket },
    { label: 'Wins', href: '/admin/wins', icon: Trophy },
    { label: 'Transactions', href: '/admin/transactions', icon: Receipt },
    { label: 'Payouts', href: '/admin/payouts', icon: CreditCard },
    { label: 'Tasks', href: '/admin/tasks', icon: Zap },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <div className="animate-spin w-10 h-10 border-4 border-slate-300 border-t-red-600 rounded-full mb-4"></div>
                <p className="text-slate-500 font-medium tracking-wide">Authenticating Admin...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
            {/* Mobile Top Header */}
            <div className="md:hidden bg-white border-b border-slate-200 flex items-center justify-between p-4 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <Image
                        src="/images/logo.png"
                        alt="RaffleHub"
                        width={120}
                        height={32}
                        className="object-contain"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded shadow-sm relative -ml-2 -mt-2">
                        Admin
                    </span>
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

            {/* Admin Sidebar */}
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
                <div className={`p-4 border-b border-slate-100 transition-all ${sidebarOpen ? 'block' : 'hidden'}`}>
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
                        const isActive = pathname === item.href;
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border ${isActive
                                    ? 'bg-red-50/80 text-red-700 border-red-100/50 shadow-sm relative overflow-hidden'
                                    : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                                    } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />}
                                <item.icon
                                    size={sidebarOpen ? 20 : 22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? 'text-red-600 shrink-0 relative z-10' : 'text-slate-400 group-hover:text-slate-600 transition-colors shrink-0'}
                                />
                                <span className={`font-semibold tracking-wide text-sm whitespace-nowrap transition-all duration-300 relative z-10 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
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
                            Admin Control Panel
                        </h1>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Super Admin</p>
                        </div>
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-md border-2 border-white ring-2 ring-slate-100">
                            <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 relative z-10">
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
