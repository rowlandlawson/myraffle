'use client';

import { useState } from 'react';
import {
  Search,
  Users as UsersIcon,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useAdminUsers, useSuspendUser, useActivateUser } from '@/lib/hooks/useAdmin';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [userToSuspend, setUserToSuspend] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminUsers({
    page,
    limit: 20,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const handleSuspend = (userId: string) => {
    setUserToSuspend(userId);
  };

  const confirmSuspend = () => {
    if (!userToSuspend) return;
    suspendUser.mutate(userToSuspend, {
      onSuccess: () => {
        toast.success('User suspended successfully');
        setUserToSuspend(null);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to suspend user');
        setUserToSuspend(null);
      },
    });
  };

  const handleActivate = (userId: string) => {
    activateUser.mutate(userId, {
      onSuccess: () => toast.success('User activated successfully'),
      onError: (err: any) => toast.error(err.message || 'Failed to activate user'),
    });
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
          <Shield size={12} /> Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
        User
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SUSPENDED') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
          Suspended
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
        Active
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">View and manage all platform users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {pagination?.total ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-600">
          <p className="text-sm text-gray-600">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter((u) => u.status === 'SUSPENDED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or User Number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error instanceof Error ? error.message : 'Failed to load users'}</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Points</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.userNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900">
                        ₦{user.walletBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-600">{user.rafflePoints}</td>
                      <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        {user.role !== 'ADMIN' && (
                          user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-semibold"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="text-green-600 hover:text-green-700 text-sm font-semibold"
                            >
                              Activate
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No users found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                <p>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!userToSuspend}
        title="Suspend User"
        message="Are you sure you want to suspend this user? They will not be able to log in or participate in raffles."
        confirmLabel="Suspend"
        onConfirm={confirmSuspend}
        onCancel={() => setUserToSuspend(null)}
        variant="danger"
      />
    </div>
  );
}
