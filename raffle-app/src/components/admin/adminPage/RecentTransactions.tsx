'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';

interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'ticket_sale' | 'payout';
  user: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getTransactionIcon = (type: Transaction['type']): string => {
  switch (type) {
    case 'deposit':
      return '⬇️';
    case 'withdrawal':
      return '⬆️';
    case 'ticket_sale':
      return '🎫';
    case 'payout':
      return '💰';
    default:
      return '💳';
  }
};

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
          Recent Transactions
        </h2>
        <Link
          href="/admin/transactions"
          className="text-red-600 font-semibold hover:text-red-700 text-sm md:text-base"
        >
          View All →
        </Link>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getTransactionIcon(tx.type)}</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {tx.user}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  tx.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {tx.status === 'completed' ? '✓ Done' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-900">
                ₦{tx.amount.toLocaleString()}
              </span>
              <span className="text-gray-500 text-xs">{tx.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Type
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 lg:px-6 py-3 lg:py-4">
                  <span className="text-xl lg:text-2xl">
                    {getTransactionIcon(tx.type)}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-3 lg:py-4">
                  <div className="font-semibold text-gray-900 text-sm lg:text-base">
                    {tx.user}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 lg:py-4 font-bold text-gray-900 text-sm lg:text-base">
                  ₦{tx.amount.toLocaleString()}
                </td>
                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-600 text-sm lg:text-base">
                  {tx.date}
                </td>
                <td className="px-4 lg:px-6 py-3 lg:py-4">
                  <span
                    className={`inline-block px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${
                      tx.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {tx.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
