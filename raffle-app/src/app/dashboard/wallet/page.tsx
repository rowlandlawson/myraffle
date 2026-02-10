'use client';

import { useState } from 'react';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import QuickActionCard from '@/components/wallet/QuickActionCard';
import WalletTransactionRow from '@/components/wallet/WalletTransactionRow';

type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'purchase'
  | 'reward'
  | 'refund';
type TransactionStatus = 'completed' | 'pending';

interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: TransactionStatus;
  reference: string;
}

export default function WalletPage() {
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>(
    'all',
  );
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  const walletBalance = 50000;

  const allTransactions: Transaction[] = [
    {
      id: 1,
      type: 'deposit',
      description: 'Deposit to wallet',
      amount: 10000,
      date: '2026-01-25',
      time: '14:30',
      status: 'completed',
      reference: 'DEP-2026-001',
    },
    {
      id: 2,
      type: 'purchase',
      description: 'iPhone 15 Pro Max ticket',
      amount: -5000,
      date: '2026-01-25',
      time: '10:15',
      status: 'completed',
      reference: 'TKT-2026-001',
    },
    {
      id: 3,
      type: 'withdrawal',
      description: 'Withdrawal request - Bank Transfer',
      amount: -20000,
      date: '2026-01-24',
      time: '16:45',
      status: 'pending',
      reference: 'WTH-2026-001',
    },
    {
      id: 4,
      type: 'purchase',
      description: 'MacBook Pro 14" ticket',
      amount: -8000,
      date: '2026-01-23',
      time: '09:20',
      status: 'completed',
      reference: 'TKT-2026-002',
    },
    {
      id: 5,
      type: 'reward',
      description: 'Task completed: Watch ad',
      amount: 2500,
      date: '2026-01-23',
      time: '15:00',
      status: 'completed',
      reference: 'RWD-2026-001',
    },
    {
      id: 6,
      type: 'refund',
      description: 'Raffle ticket refund',
      amount: 3000,
      date: '2026-01-22',
      time: '11:30',
      status: 'completed',
      reference: 'REF-2026-001',
    },
    {
      id: 7,
      type: 'deposit',
      description: 'Deposit to wallet',
      amount: 25000,
      date: '2026-01-21',
      time: '13:45',
      status: 'completed',
      reference: 'DEP-2026-002',
    },
    {
      id: 8,
      type: 'purchase',
      description: 'AirPods Pro Max ticket',
      amount: -3000,
      date: '2026-01-20',
      time: '17:20',
      status: 'completed',
      reference: 'TKT-2026-003',
    },
  ];

  const filteredTransactions = allTransactions.filter((tx) => {
    const statusMatch = filterStatus === 'all' || tx.status === filterStatus;
    const typeMatch = filterType === 'all' || tx.type === filterType;
    return statusMatch && typeMatch;
  });

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <WalletBalanceCard
        balance={walletBalance}
        totalDeposited="₦60,000"
        totalSpent="₦16,000"
        pendingWithdrawal="₦20,000"
        totalEarnings="₦5,500"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          href="/dashboard/wallet/add-funds"
          icon="💳"
          title="Add Funds"
          description="Deposit money to your wallet"
          borderColor="border-green-600"
          iconBgColor="bg-green-100"
        />
        <QuickActionCard
          href="/dashboard/wallet/withdraw"
          icon="🏦"
          title="Withdraw"
          description="Request withdrawal to your bank"
          borderColor="border-blue-600"
          iconBgColor="bg-blue-100"
        />
      </div>

      {/* Transaction Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as TransactionType | 'all')
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Transactions</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="purchase">Purchases</option>
              <option value="reward">Rewards</option>
              <option value="refund">Refunds</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as TransactionStatus | 'all')
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Transactions Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Reference
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <WalletTransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Transactions List (Mobile) */}
        <div className="md:hidden space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      transaction.type === 'deposit'
                        ? 'bg-green-100 text-green-700'
                        : transaction.type === 'withdrawal'
                          ? 'bg-red-100 text-red-700'
                          : transaction.type === 'purchase'
                            ? 'bg-blue-100 text-blue-700'
                            : transaction.type === 'reward'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {transaction.type === 'deposit'
                      ? '⬇️'
                      : transaction.type === 'withdrawal'
                        ? '⬆️'
                        : transaction.type === 'purchase'
                          ? '🎫'
                          : transaction.type === 'reward'
                            ? '⚡'
                            : '↩️'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.date} • {transaction.time}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}
                >
                  {transaction.amount > 0 ? '+' : ''}₦
                  {Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100 mt-1">
                <span className="font-mono">{transaction.reference}</span>
                <span
                  className={`px-2 py-1 rounded-full font-semibold ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {transaction.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No transactions found</p>
          </div>
        )}
      </div>

      {/* Transaction Count */}
      <div className="text-center text-gray-600 text-sm">
        Showing {filteredTransactions.length} of {allTransactions.length}{' '}
        transactions
      </div>
    </div>
  );
}
