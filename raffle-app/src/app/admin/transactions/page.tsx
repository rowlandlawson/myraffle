'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'purchase'
  | 'reward'
  | 'refund';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  date: string;
  time: string;
}

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>(
    'all',
  );

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      userId: 'USR-001',
      userName: 'John Doe',
      type: 'deposit',
      amount: 50000,
      status: 'completed',
      reference: 'DEP-2026-001',
      date: '2026-01-29',
      time: '14:30',
    },
    {
      id: '2',
      userId: 'USR-002',
      userName: 'Jane Smith',
      type: 'purchase',
      amount: 5000,
      status: 'completed',
      reference: 'TKT-2026-001',
      date: '2026-01-29',
      time: '13:45',
    },
    {
      id: '3',
      userId: 'USR-003',
      userName: 'Mike Johnson',
      type: 'withdrawal',
      amount: 25000,
      status: 'pending',
      reference: 'WTH-2026-001',
      date: '2026-01-29',
      time: '12:00',
    },
    {
      id: '4',
      userId: 'USR-001',
      userName: 'John Doe',
      type: 'reward',
      amount: 500,
      status: 'completed',
      reference: 'RWD-2026-001',
      date: '2026-01-28',
      time: '16:20',
    },
    {
      id: '5',
      userId: 'USR-004',
      userName: 'Sarah Wilson',
      type: 'deposit',
      amount: 100000,
      status: 'failed',
      reference: 'DEP-2026-002',
      date: '2026-01-28',
      time: '10:15',
    },
    {
      id: '6',
      userId: 'USR-002',
      userName: 'Jane Smith',
      type: 'refund',
      amount: 3000,
      status: 'completed',
      reference: 'REF-2026-001',
      date: '2026-01-27',
      time: '09:30',
    },
    {
      id: '7',
      userId: 'USR-005',
      userName: 'David Brown',
      type: 'purchase',
      amount: 8000,
      status: 'completed',
      reference: 'TKT-2026-002',
      date: '2026-01-27',
      time: '18:45',
    },
    {
      id: '8',
      userId: 'USR-003',
      userName: 'Mike Johnson',
      type: 'deposit',
      amount: 75000,
      status: 'completed',
      reference: 'DEP-2026-003',
      date: '2026-01-26',
      time: '11:00',
    },
  ]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: TransactionType) => {
    const styles = {
      deposit: 'bg-green-100 text-green-800',
      withdrawal: 'bg-blue-100 text-blue-800',
      purchase: 'bg-purple-100 text-purple-800',
      reward: 'bg-yellow-100 text-yellow-800',
      refund: 'bg-orange-100 text-orange-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${styles[type]}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalVolume = transactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0,
  );
  const completedCount = transactions.filter(
    (tx) => tx.status === 'completed',
  ).length;
  const pendingCount = transactions.filter(
    (tx) => tx.status === 'pending',
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-600">
            View and manage all platform transactions
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Total Volume</p>
          <p className="text-2xl font-bold text-gray-900">
            ₦{totalVolume.toLocaleString()}
          </p>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as TransactionType | 'all')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="purchase">Purchase</option>
              <option value="reward">Reward</option>
              <option value="refund">Refund</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TransactionStatus | 'all')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-mono text-sm text-gray-900">
                    {tx.reference}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tx.userName}
                      </p>
                      <p className="text-xs text-gray-500">{tx.userId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{getTypeBadge(tx.type)}</td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`font-semibold flex items-center justify-end gap-1 ${
                        ['deposit', 'reward', 'refund'].includes(tx.type)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {['deposit', 'reward', 'refund'].includes(tx.type) ? (
                        <ArrowDownLeft size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                      ₦{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{tx.date}</p>
                    <p className="text-xs text-gray-500">{tx.time}</p>
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(tx.status)}</td>
                  <td className="px-4 py-4">
                    <button className="text-red-600 hover:text-red-700 text-sm font-semibold">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No transactions found</p>
          </div>
        )}

        {/* Pagination placeholder */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <p>
            Showing {filteredTransactions.length} of {transactions.length}{' '}
            transactions
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
              Previous
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
              2
            </button>
            <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
