'use client';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  type AdminUser,
  useActivateUser,
  useAdminUsers,
  useSuspendUser,
} from '@/lib/hooks/useAdmin';
import { MapPin, Phone, Search, Shield, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function UserDrawer({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const hasAddress = user.address || user.city || user.state;
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.userNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Contact Info
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Phone size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Phone (registration)</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.phone || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin size={11} /> Delivery Address
            </h3>
            {hasAddress ? (
              <div className="space-y-1">
                {user.address && <p className="text-sm text-gray-800">{user.address}</p>}
                {(user.city || user.state) && (
                  <p className="text-sm text-gray-600">
                    {[user.city, user.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No delivery address saved</p>
            )}
          </div>

          {/* Account Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Account</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-100 col-span-2">
                <p className="text-[11px] text-gray-400">Wallet Balance</p>
                <p className="font-bold text-gray-900">
                  ₦{user.walletBalance.toLocaleString('en-NG')}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[11px] text-gray-400">Tickets</p>
                <p className="font-bold text-gray-900">{user._count.tickets}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-[11px] text-gray-400">Transactions</p>
                <p className="font-bold text-gray-900">{user._count.transactions}</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Joined{' '}
            {new Date(user.createdAt).toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [userToSuspend, setUserToSuspend] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to suspend user');
        setUserToSuspend(null);
      },
    });
  };

  const handleActivate = (userId: string) => {
    activateUser.mutate(userId, {
      onSuccess: () => toast.success('User activated successfully'),
      onError: (err: Error) => toast.error(err.message || 'Failed to activate user'),
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
          <p className="text-2xl font-bold text-gray-900">{pagination?.total ?? 0}</p>
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
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
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'Failed to load users'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <button onClick={() => setSelectedUser(user)} className="text-left group">
                          <p className="font-semibold text-gray-900 group-hover:text-red-600 transition">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.userNumber}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {user.phone}
                            </p>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900">
                        ₦{user.walletBalance.toLocaleString('en-NG')}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                          >
                            View
                          </button>
                          {user.role !== 'ADMIN' &&
                            (user.status === 'ACTIVE' ? (
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
                            ))}
                        </div>
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

      {/* User Detail Drawer */}
      {selectedUser && <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}

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
