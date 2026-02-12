'use client';

import { useState } from 'react';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import QuickActionCard from '@/components/wallet/QuickActionCard';
import WalletTransactionRow from '@/components/wallet/WalletTransactionRow';
import { useWalletBalance, useWalletTransactions } from '@/lib/useWallet';

type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'purchase'
  | 'reward'
  | 'refund';
type TransactionStatus = 'completed' | 'pending';

export default function WalletPage() {
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>(
    'all',
  );
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  const { balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: txData, isLoading: txLoading } = useWalletTransactions();

  // Map backend transaction types to frontend types
  const mapType = (type: string): TransactionType => {
    const mapping: Record<string, TransactionType> = {
      DEPOSIT: 'deposit',
      WITHDRAWAL: 'withdrawal',
      TICKET_PURCHASE: 'purchase',
      TASK_REWARD: 'reward',
      RAFFLE_WIN: 'reward',
      REFUND: 'refund',
    };
    return mapping[type] || 'deposit';
  };

  const mapStatus = (status: string): TransactionStatus => {
    return status === 'COMPLETED' ? 'completed' : 'pending';
  };

  // Transform backend transactions for display
  const allTransactions = (txData?.transactions || []).map((tx) => {
    const date = new Date(tx.createdAt);
    return {
      id: tx.id,
      type: mapType(tx.type),
      description: tx.description || `${tx.type} transaction`,
      amount:
        tx.type === 'WITHDRAWAL' || tx.type === 'TICKET_PURCHASE'
          ? -tx.amount
          : tx.amount,
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().slice(0, 5),
      status: mapStatus(tx.status),
      reference: tx.reference || `TXN-${tx.id.slice(0, 8)}`,
    };
  });

  const filteredTransactions = allTransactions.filter((tx) => {
    const statusMatch = filterStatus === 'all' || tx.status === filterStatus;
    const typeMatch = filterType === 'all' || tx.type === filterType;
    return statusMatch && typeMatch;
  });

  if (balanceLoading || txLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <WalletBalanceCard
        balance={balance?.walletBalance || 0}
        totalDeposited="—"
        totalSpent="—"
        pendingWithdrawal="—"
        totalEarnings="—"
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${transaction.type === 'deposit'
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
                  className={`px-2 py-1 rounded-full font-semibold ${transaction.status === 'completed'
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
