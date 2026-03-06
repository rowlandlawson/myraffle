'use client';

import DashboardHeader from '@/components/admin/adminPage/DashboardHeader';
import StatsGrid from '@/components/admin/adminPage/StatsGrid';
import AlertCards from '@/components/admin/adminPage/AlertCards';
import ActiveRaffles from '@/components/admin/adminPage/ActiveRaffles';
import RecentTransactions from '@/components/admin/adminPage/RecentTransactions';
import SystemHealth from '@/components/admin/adminPage/SystemHealth';
import QuickActions from '@/components/admin/adminPage/QuickActions';
import { useAdminDashboard } from '@/lib/hooks/useAdmin';

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-600">
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </p>
      </div>
    );
  }

  // Map active raffles for the component
  const mappedRaffles = data.activeRaffles.map((r: any) => {
    const now = new Date();
    const end = new Date(r.raffleDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    return {
      id: r.id,
      itemName: r.item.name,
      ticketsSold: r.ticketsSold,
      ticketsTotal: r.ticketsTotal,
      endsIn: days <= 0 ? 'Ended' : days === 1 ? '1 day' : `${days} days`,
      revenue: r.ticketsSold * r.ticketPrice,
      status: r.status.toLowerCase(),
    };
  });

  // Map recent transactions for the component
  const mappedTransactions = data.recentTransactions.map((tx: any) => {
    const typeMap: Record<string, string> = {
      DEPOSIT: 'deposit',
      WITHDRAWAL: 'withdrawal',
      TICKET_PURCHASE: 'ticket_sale',
      TASK_REWARD: 'payout',
      RAFFLE_WIN: 'payout',
      REFUND: 'payout',
    };

    return {
      id: tx.id,
      type: (typeMap[tx.type] || 'deposit') as 'deposit' | 'withdrawal' | 'ticket_sale' | 'payout',
      user: tx.user.name,
      amount: tx.amount,
      date: new Date(tx.createdAt).toISOString().split('T')[0],
      status: (tx.status === 'COMPLETED' ? 'completed' : 'pending') as 'completed' | 'pending',
    };
  });

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
      />

      {/* Main Stats */}
      <StatsGrid stats={data.stats} />

      {/* Alerts */}
      <AlertCards
        alerts={{
          pendingPayouts: data.stats.pendingPayouts,
          failedTransactions: data.stats.failedTransactions,
        }}
      />

      {/* Active Raffles */}
      <ActiveRaffles raffles={mappedRaffles} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={mappedTransactions} />

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemHealth />
        <QuickActions />
      </div>
    </div>
  );
}
