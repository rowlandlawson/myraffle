'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Menu,
  X,
  LogOut,
  Settings,
  BarChart3,
  Users,
  Gift,
  Zap,
  Home,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  TrendingUp,
  Ticket,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const admin = {
    name: 'Admin User',
    email: 'admin@rafflehub.ng',
    role: 'Administrator',
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Items', href: '/admin/items', icon: Gift },
    { label: 'Raffles', href: '/admin/raffles', icon: Ticket },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { label: 'Payouts', href: '/admin/payouts', icon: DollarSign },
    { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-center px-4 py-3 relative">
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
              {admin.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
              {admin.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>

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
              <div className="relative h-10 w-32">
                <Image
                  src="/images/logo.png"
                  alt="RaffleHub"
                  fill
                  className="object-contain"
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

          {/* Admin Info */}
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="p-6 border-b border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="font-bold text-gray-900">{admin.name}</div>
                <div className="text-xs text-gray-600 mt-1">{admin.email}</div>
                <div className="text-xs font-semibold text-red-600 mt-2">
                  {admin.role}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                <item.icon size={20} />
                {(sidebarOpen || mobileMenuOpen) && (
                  <span className="font-semibold">{item.label}</span>
                )}
              </a>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition font-semibold">
              <LogOut size={20} />
              {(sidebarOpen || mobileMenuOpen) && 'Logout'}
            </button>
          </div>

          {/* Collapse Button (Desktop Only) */}
          <div className="hidden md:block p-6 border-t border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              {sidebarOpen ? '«' : '»'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full md:w-auto overflow-x-hidden">
          {/* Mobile Overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          {/* Top Header */}
          <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-8 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Logged in as</div>
                  <div className="font-semibold text-gray-900">
                    {admin.name}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                  {admin.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[60]">
        <div className="flex justify-around items-center h-16">
          <a
            href="/admin"
            className="flex flex-col items-center justify-center flex-1 py-3 text-red-600 hover:text-red-700"
          >
            <LayoutDashboard size={22} />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a
            href="/admin/items"
            className="flex flex-col items-center justify-center flex-1 py-3 text-gray-600 hover:text-red-600"
          >
            <Gift size={22} />
            <span className="text-xs mt-1">Items</span>
          </a>
          <a
            href="/admin/users"
            className="flex flex-col items-center justify-center flex-1 py-3 text-gray-600 hover:text-red-600"
          >
            <Users size={22} />
            <span className="text-xs mt-1">Users</span>
          </a>
          <a
            href="/admin/analytics"
            className="flex flex-col items-center justify-center flex-1 py-3 text-gray-600 hover:text-red-600"
          >
            <TrendingUp size={22} />
            <span className="text-xs mt-1">Stats</span>
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
