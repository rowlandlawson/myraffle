'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useAdminTransactions } from '@/lib/hooks/useAdmin';

type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TICKET_PURCHASE' | 'TASK_REWARD' | 'RAFFLE_WIN' | 'REFUND';
type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useAdminTransactions({
    page,
    limit: 20,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined,
  });

  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination;

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      DEPOSIT: 'bg-green-100 text-green-800',
      WITHDRAWAL: 'bg-blue-100 text-blue-800',
      TICKET_PURCHASE: 'bg-purple-100 text-purple-800',
      TASK_REWARD: 'bg-yellow-100 text-yellow-800',
      RAFFLE_WIN: 'bg-orange-100 text-orange-800',
      REFUND: 'bg-gray-100 text-gray-800',
    };
    const label = type.replace(/_/g, ' ').charAt(0) + type.replace(/_/g, ' ').slice(1).toLowerCase();
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const totalVolume = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const completedCount = transactions.filter((tx) => tx.status === 'COMPLETED').length;
  const pendingCount = transactions.filter((tx) => tx.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-600">View and manage all platform transactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Page Volume</p>
          <p className="text-2xl font-bold text-gray-900">₦{totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-600">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, user ID, or reference..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="TICKET_PURCHASE">Purchase</option>
              <option value="TASK_REWARD">Reward</option>
              <option value="REFUND">Refund</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error instanceof Error ? error.message : 'Failed to load'}</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-mono text-sm text-gray-900">
                        {tx.reference || tx.id.slice(0, 12)}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{tx.user.name}</p>
                          <p className="text-xs text-gray-500">{tx.user.userNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getTypeBadge(tx.type)}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-semibold flex items-center justify-end gap-1 ${['DEPOSIT', 'TASK_REWARD', 'RAFFLE_WIN', 'REFUND'].includes(tx.type)
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}>
                          {['DEPOSIT', 'TASK_REWARD', 'RAFFLE_WIN', 'REFUND'].includes(tx.type) ? (
                            <ArrowDownLeft size={14} />
                          ) : (
                            <ArrowUpRight size={14} />
                          )}
                          {tx.type === 'TASK_REWARD' ? (
                            <>{tx.amount.toLocaleString()} <span className="text-xs">⭐ pts</span></>
                          ) : (
                            <>₦{tx.amount.toLocaleString()}</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(tx.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No transactions found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                <p>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} transactions)
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
    </div>
  );
}
