'use client';

import { TrendingUp } from 'lucide-react';
import { User } from '@/types/users';

interface TopSpendersProps {
  users: User[];
  title?: string;
  maxItems?: number;
}

export default function TopSpenders({
  users,
  title = 'Top Spenders',
  maxItems = 3,
}: TopSpendersProps) {
  const topSpenders = [...users]
    .filter((user) => user.status === 'active')
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {topSpenders.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600">Joined {user.joinDate}</p>
            </div>
            <div className="text-right">
              <span className="block font-bold text-gray-900">
                ₦{user.totalSpent.toLocaleString()}
              </span>
              <span className="text-xs text-gray-600">
                {user.ticketsPurchased} tickets
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
