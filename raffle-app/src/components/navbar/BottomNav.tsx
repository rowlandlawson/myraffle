'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Ticket, Wallet, ShoppingBag } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Items', href: '/items', icon: ShoppingBag },
  { label: 'Tickets', href: '/login', icon: Ticket },
  { label: 'Wallet', href: '/login', icon: Wallet },
  { label: 'Wins', href: '/login', icon: Trophy },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-[60] md:hidden shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${active ? 'text-red-600' : 'text-gray-400'
                  }`}
              >
                <item.icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-red-600' : 'text-gray-400'}
                />
                <span
                  className={`text-[10px] font-semibold ${active ? 'text-red-600' : 'text-gray-400'
                    }`}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-red-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile navbar */}
      <div className="h-16 md:hidden" />
    </>
  );
}
