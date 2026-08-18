'use client';

import Card from '@/components/ui/Card';
import { BarChart3, FileDown, Megaphone, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: 'red' | 'blue' | 'green' | 'purple';
  href?: string;
  onClick?: () => void;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      label: 'Create New Raffle',
      icon: Plus,
      color: 'red',
      href: '/admin/raffles',
    },
    {
      label: 'Send Announcement',
      icon: Megaphone,
      color: 'blue',
      onClick: () => toast('Announcements coming soon!', { icon: '📢' }),
    },
    {
      label: 'Download Report',
      icon: FileDown,
      color: 'green',
      href: '/admin/analytics',
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      color: 'purple',
      href: '/admin/analytics',
    },
  ];

  const colorClasses = {
    red: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100',
  };

  return (
    <Card>
      <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg font-semibold transition-all active:scale-[0.98] ${colorClasses[action.color]}`}
            >
              <action.icon size={18} />
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg font-semibold transition-all active:scale-[0.98] ${colorClasses[action.color]}`}
            >
              <action.icon size={18} />
              {action.label}
            </button>
          ),
        )}
      </div>
    </Card>
  );
}
