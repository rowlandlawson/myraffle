'use client';

import { useState, ReactNode } from 'react';
import Image from 'next/image';
import {
  Menu,
  X,
  LogOut,
  Settings,
  Wallet,
  Ticket,
  Zap,
  Home,
  LucideIcon,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock user data
  const user = {
    name: 'John Doe',
    userNumber: 'USER-98765',
    email: 'john@example.com',
    walletBalance: 50000,
    rafflePoints: 2500,
  };

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { label: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
    { label: 'Earnings', href: '/dashboard/earnings', icon: Zap },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-center px-4 py-3 relative">
          <div className="absolute left-4">
            {/* Optional: Add back button or menu trigger if needed here later */}
          </div>
          <div className="h-14 flex items-center">
            <Image
              src="/images/logo.png"
              alt="RaffleHub"
              width={180}
              height={60}
              className="h-full w-auto object-contain"
            />
          </div>

          <div className="absolute right-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">
              {user.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
            md:static md:translate-x-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
            w-64
          `}
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="relative h-auto w-40">
                <Image
                  src="/images/logo.png"
                  alt="RaffleHub"
                  width={160}
                  height={60}
                  className="h-auto w-40 object-contain"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          {sidebarOpen && (
            <div className="p-6 border-b border-gray-200">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="text-sm text-gray-600 mb-1">Account Number</div>
                <div className="font-bold text-gray-900 text-lg">
                  {user.userNumber}
                </div>
                <div className="text-xs text-gray-600 mt-2">{user.email}</div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 p-6 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                <item.icon size={20} />
                {sidebarOpen && (
                  <span className="font-semibold">{item.label}</span>
                )}
              </a>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition font-semibold">
              <LogOut size={20} />
              {sidebarOpen && 'Logout'}
            </button>
          </div>

          {/* Collapse Button */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              {sidebarOpen ? '«' : '»'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Header */}
          <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-8 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Welcome back</div>
                  <div className="font-semibold text-gray-900">{user.name}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center">
          <a
            href="/dashboard"
            className="flex flex-col items-center justify-center flex-1 py-3 text-red-600 font-semibold"
          >
            <Home size={22} />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a
            href="/dashboard/wallet"
            className="flex flex-col items-center justify-center flex-1 py-3 text-gray-600 hover:text-red-600"
          >
            <Wallet size={22} />
            <span className="text-xs mt-1">Wallet</span>
          </a>
          <a
            href="/dashboard/tickets"
            className="flex flex-col items-center justify-center flex-1 py-3 text-gray-600 hover:text-red-600"
          >
            <Ticket size={22} />
            <span className="text-xs mt-1">Tickets</span>
          </a>
          <a
            href="/dashboard/earnings"
            className="flex flex-col items-center justify-center flex-1 py-3 text-gray-600 hover:text-red-600"
          >
            <Zap size={22} />
            <span className="text-xs mt-1">Earn</span>
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 py-3 font-semibold transition-colors ${mobileMenuOpen ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600'}`}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
