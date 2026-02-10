'use client';

import { User } from '@/types/users';
import EmptyState from '@/components/users/EmptyState';
import { Trash2, Edit2, Eye } from 'lucide-react';

interface UsersTableProps {
  users: User[];
  onToggleStatus: (id: number) => void;
  onEdit?: (user: User) => void;
  onView?: (user: User) => void;
  onDelete?: (id: number) => void; // Add this line
}

export default function UsersTable({
  users,
  onToggleStatus,
  onEdit,
  onView,
  onDelete, // Add this to destructuring
}: UsersTableProps) {
  const getStatusColor = (status: User['status']) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `₦${(balance / 1000000).toFixed(2)}M`;
    } else if (balance >= 1000) {
      return `₦${(balance / 1000).toFixed(1)}k`;
    }
    return `₦${balance.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Balance
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Activity
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {user.userNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-600">{user.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}
                  >
                    {user.status === 'active' ? '✓ Active' : '⛔ Suspended'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">
                    {formatBalance(user.balance)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {user.rafflePoints.toLocaleString()} points
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {user.ticketsPurchased} tickets
                    <div className="text-xs text-gray-600">
                      Spent: ₦{user.totalSpent.toLocaleString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-yellow-600"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`p-2 rounded-lg transition ${
                        user.status === 'active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={
                        user.status === 'active'
                          ? 'Suspend User'
                          : 'Activate User'
                      }
                    >
                      {user.status === 'active' ? '⛔' : '✓'}
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-red-600"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && <EmptyState />}
    </div>
  );
}
