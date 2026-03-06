'use client';

import Link from 'next/link';
import { Zap, DollarSign } from 'lucide-react';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import StatCard from '@/components/dashboard/StatCard';
import ActiveTicketCard from '@/components/dashboard/ActiveTicketCard';
import TransactionItem from '@/components/dashboard/TransactionItem';
import RecentItemCard from '@/components/dashboard/RecentItemCard';
import { useAuthStore } from '@/lib/authStore';
import { useWalletTransactions } from '@/lib/hooks/useWallet';
import { useTicketHistory } from '@/lib/hooks/useTickets';
import { useRaffles } from '@/lib/hooks/useRaffles';

export default function DashboardHome() {
  const { user } = useAuthStore();

  const { data: txData, isLoading: txLoading } = useWalletTransactions(1, 5);
  const { data: ticketData, isLoading: ticketsLoading } = useTicketHistory();
  const { data: raffleData, isLoading: rafflesLoading } = useRaffles({ status: 'ACTIVE', limit: 4 });

  const ticketStats = ticketData?.stats ?? { total: 0, active: 0, won: 0, lost: 0 };
  const apiTickets = ticketData?.tickets ?? [];
  const activeRaffles = raffleData?.raffles ?? [];

  // Filter active tickets from history
  const activeTickets = apiTickets
    .filter(t => t.status === 'ACTIVE')
    .slice(0, 3)
    .map(t => {
      const now = new Date();
      const raffleEnd = new Date(t.raffle.raffleDate);
      const daysLeft = Math.max(0, Math.ceil((raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const imageUrl = t.raffle.item.imageUrl?.startsWith('/uploads')
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${t.raffle.item.imageUrl}`
        : t.raffle.item.imageUrl || '📦';

      return {
        id: t.id as any,
        item: t.raffle.item.name,
        image: imageUrl,
        ticketNumber: t.ticketNumber,
        purchaseDate: new Date(t.createdAt).toLocaleDateString(),
        status: t.status.toLowerCase(),
        endsIn: `${daysLeft} days`,
      };
    });

  // Map transactions
  const mapTxType = (type: string) => {
    const mapping: Record<string, 'deposit' | 'withdrawal' | 'purchase' | 'reward' | 'refund'> = {
      DEPOSIT: 'deposit',
      WITHDRAWAL: 'withdrawal',
      TICKET_PURCHASE: 'purchase',
      TASK_REWARD: 'reward',
      RAFFLE_WIN: 'reward',
      REFUND: 'refund',
    };
    return mapping[type] || 'deposit';
  };

  const recentTransactions = (txData?.transactions || []).map(tx => ({
    id: tx.id as any,
    type: mapTxType(tx.type),
    description: tx.description || `${tx.type} transaction`,
    amount: tx.type === 'WITHDRAWAL' || tx.type === 'TICKET_PURCHASE' ? -tx.amount : tx.amount,
    date: new Date(tx.createdAt).toLocaleDateString(),
    status: tx.status === 'COMPLETED' ? 'completed' : 'pending' as const,
  }));

  // Map available items
  const availableItems = activeRaffles.map(r => {
    const progress = Math.min(100, Math.round((r.ticketsSold / r.ticketsTotal) * 100));
    const imageUrl = r.item.imageUrl?.startsWith('/uploads')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${r.item.imageUrl}`
      : r.item.imageUrl || '📦';

    return {
      id: r.id as any,
      name: r.item.name,
      image: imageUrl,
      price: r.ticketPrice,
      progress,
    };
  });

  if (!user || txLoading || ticketsLoading || rafflesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
          value={ticketStats.active}
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
          {activeTickets.length > 0 ? (
            activeTickets.map((ticket) => (
              <ActiveTicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No active tickets. Buy a raffle ticket to get started!</p>
          )}
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
            {availableItems.length > 0 ? (
              availableItems.map((item) => (
                <RecentItemCard key={item.id} item={item as any} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No active raffles right now.</p>
            )}
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
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction as any} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent transactions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
