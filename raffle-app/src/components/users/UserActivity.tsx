'use client';

import { Activity } from 'lucide-react';
import { User } from '@/types/users';

interface UserActivityProps {
  users: User[];
  title?: string;
  maxItems?: number;
}

export default function UserActivity({
  users,
  title = 'Most Active Users',
  maxItems = 3,
}: UserActivityProps) {
  const activeUsers = [...users]
    .filter((user) => user.status === 'active')
    .sort((a, b) => b.ticketsPurchased - a.ticketsPurchased)
    .slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600">
                Last active: {user.lastActive}
              </p>
            </div>
            <div className="text-right">
              <span className="block font-bold text-gray-900">
                {user.ticketsPurchased} tickets
              </span>
              <span className="text-xs text-gray-600">
                {user.totalSpent.toLocaleString()} spent
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
