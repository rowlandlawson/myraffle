'use client';

import Link from 'next/link';
import { Zap, DollarSign } from 'lucide-react';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import StatCard from '@/components/dashboard/StatCard';
import ActiveTicketCard from '@/components/dashboard/ActiveTicketCard';
import TransactionItem from '@/components/dashboard/TransactionItem';
import RecentItemCard from '@/components/dashboard/RecentItemCard';
import TipsSection from '@/components/dashboard/TipsSection';

export default function DashboardHome() {
  // Mock user data
  const user = {
    name: 'John Doe',
    userNumber: 'USER-98765',
    walletBalance: 50000,
    rafflePoints: 2500,
  };

  // Mock recent transactions
  const recentTransactions: {
    id: number;
    type: 'deposit' | 'withdrawal' | 'purchase' | 'reward';
    description: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending';
  }[] = [
    {
      id: 1,
      type: 'deposit',
      description: 'Deposit to wallet',
      amount: 10000,
      date: '2 hours ago',
      status: 'completed',
    },
    {
      id: 2,
      type: 'purchase',
      description: 'iPhone 15 Pro Max ticket',
      amount: -5000,
      date: '5 hours ago',
      status: 'completed',
    },
    {
      id: 3,
      type: 'withdrawal',
      description: 'Withdrawal request',
      amount: -20000,
      date: '1 day ago',
      status: 'pending',
    },
    {
      id: 4,
      type: 'reward',
      description: 'Task completed: Watch ad',
      amount: 2500,
      date: '2 days ago',
      status: 'completed',
    },
  ];

  // Mock active tickets
  const activeTickets = [
    {
      id: 1,
      item: 'iPhone 15 Pro Max',
      image: '📱',
      ticketNumber: '#12345',
      purchaseDate: 'Today',
      status: 'active',
      endsIn: '2 days',
    },
    {
      id: 2,
      item: 'MacBook Pro 14"',
      image: '💻',
      ticketNumber: '#67890',
      purchaseDate: 'Yesterday',
      status: 'active',
      endsIn: '5 days',
    },
    {
      id: 3,
      item: 'AirPods Pro Max',
      image: '🎧',
      ticketNumber: '#54321',
      purchaseDate: '3 days ago',
      status: 'active',
      endsIn: '1 day',
    },
  ];

  // Mock available items
  const availableItems = [
    { id: 1, name: 'iPad Pro 12.9"', image: '📲', price: 4500, progress: 75 },
    {
      id: 2,
      name: 'Apple Watch Ultra',
      image: '⌚',
      price: 2500,
      progress: 60,
    },
    { id: 3, name: 'PlayStation 5', image: '🎮', price: 6000, progress: 100 },
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <WelcomeBanner userName={user.name} userNumber={user.userNumber} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Wallet Balance"
          value={`₦${user.walletBalance.toLocaleString()}`}
          subtitle="Available balance"
          icon={<DollarSign size={24} className="text-red-600" />}
          borderColor="border-red-600"
          iconBgColor="bg-red-50"
          primaryAction={{
            label: 'Add Funds',
            href: '/dashboard/wallet/add-funds',
            variant: 'primary',
          }}
          secondaryAction={{
            label: 'Withdraw',
            href: '/dashboard/wallet/withdraw',
          }}
        />

        <StatCard
          title="Raffle Points"
          value={user.rafflePoints.toLocaleString()}
          subtitle="1,000 points = ₦100 value"
          icon={<Zap size={24} className="text-yellow-400" />}
          borderColor="border-yellow-400"
          iconBgColor="bg-yellow-50"
          primaryAction={{
            label: 'Earn More',
            href: '/dashboard/earnings',
            variant: 'muted',
          }}
        />

        <StatCard
          title="Active Tickets"
          value={activeTickets.length}
          subtitle="Tickets in active raffles"
          icon={<span className="text-2xl">🎫</span>}
          borderColor="border-blue-600"
          iconBgColor="bg-blue-50"
          primaryAction={{
            label: 'View Tickets',
            href: '/dashboard/tickets',
            variant: 'muted',
          }}
        />
      </div>

      {/* Your Active Tickets Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Active Tickets
          </h2>
          <Link
            href="/dashboard/tickets"
            className="text-red-600 font-semibold hover:text-red-700"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-4">
          {activeTickets.map((ticket) => (
            <ActiveTicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>

      {/* Available Items & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Items */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recently Added Items
            </h2>
            <Link
              href="/items"
              className="text-red-600 font-semibold hover:text-red-700 text-sm"
            >
              Browse All →
            </Link>
          </div>
          <div className="space-y-4">
            {availableItems.map((item) => (
              <RecentItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Transactions
            </h2>
            <Link
              href="/dashboard/wallet"
              className="text-red-600 font-semibold hover:text-red-700 text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      </div>

      <TipsSection />
    </div>
  );
}
