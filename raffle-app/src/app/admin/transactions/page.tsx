'use client';

import { useAdminTransactions } from '@/lib/hooks/useAdmin';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Receipt,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'DEPOSIT', label: 'Deposits' },
  { value: 'TICKET_PURCHASE', label: 'Ticket Purchases' },
  { value: 'TASK_REWARD', label: 'Task Rewards' },
  { value: 'RAFFLE_WIN', label: 'Raffle Wins' },
  { value: 'REFUND', label: 'Refunds' },
];

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useAdminTransactions({
    page,
    limit: 20,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined,
  });

  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination;

  // Working CSV export function
  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = ['Reference', 'User', 'User ID', 'Type', 'Amount (NGN)', 'Status', 'Date'];
    const rows = transactions.map((tx) => [
      `"${tx.reference || tx.id}"`,
      `"${tx.user?.name || 'Unknown'}"`,
      `"${tx.user?.userNumber || ''}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${tx.status}"`,
      `"${new Date(tx.createdAt).toLocaleString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `transactions_export_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { label: string; style: string }> = {
      DEPOSIT: {
        label: 'Deposit',
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      WITHDRAWAL: {
        label: 'Withdrawal',
        style: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      TICKET_PURCHASE: {
        label: 'Purchase',
        style: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      TASK_REWARD: {
        label: 'Task Reward',
        style: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      RAFFLE_WIN: {
        label: 'Raffle Win',
        style: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      REFUND: {
        label: 'Refund',
        style: 'bg-gray-100 text-gray-700 border-gray-200',
      },
    };
    const conf = configs[type] || {
      label: type,
      style: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.style}`}>
        {conf.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <XCircle size={12} />
        Failed
      </span>
    );
  };

  const isIncoming = (type: string) =>
    ['DEPOSIT', 'TASK_REWARD', 'RAFFLE_WIN', 'REFUND'].includes(type);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <Receipt className="text-red-600 shrink-0" size={28} />
            Transactions History
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time financial activity and audit log across deposits, purchases, and awards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-sm"
            title="Refresh transactions"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!transactions.length}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition shadow-sm shrink-0"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference, user name, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
              <Filter size={14} className="text-gray-400 shrink-0" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Transaction Content ── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">Fetching transaction logs...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center">
          <p className="text-sm font-bold text-red-600">
            {error instanceof Error ? error.message : 'Failed to load transactions.'}
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Receipt size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-800">No transactions found</p>
          <p className="text-xs text-gray-400 mt-1">
            Try resetting your search or filter parameters.
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table View (Hidden on mobile) ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {transactions.map((tx) => {
                    const inc = isIncoming(tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-gray-800">
                          {tx.reference || tx.id.slice(0, 14)}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {tx.user?.name || 'User'}
                            </p>
                            <p className="text-xs font-medium text-gray-400">
                              {tx.user?.userNumber}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">{getTypeBadge(tx.type)}</td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`font-black text-sm inline-flex items-center gap-1 justify-end ${
                              inc ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {inc ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                            {tx.type === 'TASK_REWARD' ? (
                              <>{tx.amount.toLocaleString()} pts</>
                            ) : (
                              <>₦{tx.amount.toLocaleString()}</>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-gray-800">
                            {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {new Date(tx.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>
                        <td className="px-5 py-4">{getStatusBadge(tx.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Card View (Shown only on small screens) ── */}
          <div className="block md:hidden space-y-3">
            {transactions.map((tx) => {
              const inc = isIncoming(tx.type);
              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{tx.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400 font-medium">{tx.user?.userNumber}</p>
                    </div>
                    {getStatusBadge(tx.status)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Reference</p>
                      <p className="font-mono text-xs font-bold text-gray-700">
                        {tx.reference || tx.id.slice(0, 12)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Amount</p>
                      <p
                        className={`font-black text-base inline-flex items-center gap-0.5 ${
                          inc ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {inc ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        {tx.type === 'TASK_REWARD' ? (
                          <>{tx.amount.toLocaleString()} pts</>
                        ) : (
                          <>₦{tx.amount.toLocaleString()}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                    <div>{getTypeBadge(tx.type)}</div>
                    <p className="text-gray-400 font-medium text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      at{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <p className="font-medium">
                Showing Page <span className="font-bold text-gray-900">{pagination.page}</span> of{' '}
                <span className="font-bold text-gray-900">{pagination.totalPages}</span> (
                {pagination.total} total)
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
