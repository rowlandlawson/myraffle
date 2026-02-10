import DashboardHeader from '@/components/admin/adminPage/DashboardHeader';
import StatsGrid from '@/components/admin/adminPage/StatsGrid';
import AlertCards from '@/components/admin/adminPage/AlertCards';
import ActiveRaffles from '@/components/admin/adminPage/ActiveRaffles';
import RecentTransactions from '@/components/admin/adminPage/RecentTransactions';
import SystemHealth from '@/components/admin/adminPage/SystemHealth';
import QuickActions from '@/components/admin/adminPage/QuickActions';

// Define types for data
interface DashboardData {
  stats: {
    totalRevenue: number;
    revenueThisMonth: number;
    totalUsers: number;
    activeUsers: number;
    totalRaffles: number;
    activeRaffles: number;
    totalTicketsSold: number;
    winnersThisMonth: number;
    pendingPayouts: number;
    failedTransactions: number;
  };
  recentTransactions: Array<{
    id: number;
    type: 'deposit' | 'withdrawal' | 'ticket_sale' | 'payout';
    user: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending';
  }>;
  activeRaffles: Array<{
    id: number;
    itemName: string;
    ticketsSold: number;
    ticketsTotal: number;
    endsIn: string;
    revenue: number;
    status: string;
  }>;
}

export default function AdminDashboard() {
  // Dashboard data
  const data: DashboardData = {
    stats: {
      totalRevenue: 2850000,
      revenueThisMonth: 850000,
      totalUsers: 12450,
      activeUsers: 3680,
      totalRaffles: 85,
      activeRaffles: 12,
      totalTicketsSold: 45230,
      winnersThisMonth: 248,
      pendingPayouts: 450000,
      failedTransactions: 3,
    },
    recentTransactions: [
      {
        id: 1,
        type: 'deposit',
        user: 'John Doe',
        amount: 25000,
        date: '2026-01-25',
        status: 'completed',
      },
      {
        id: 2,
        type: 'withdrawal',
        user: 'Sarah M.',
        amount: 15000,
        date: '2026-01-25',
        status: 'pending',
      },
      {
        id: 3,
        type: 'ticket_sale',
        user: 'Alex K.',
        amount: 5000,
        date: '2026-01-25',
        status: 'completed',
      },
      {
        id: 4,
        type: 'payout',
        user: 'Maria L.',
        amount: 850000,
        date: '2026-01-24',
        status: 'completed',
      },
    ],
    activeRaffles: [
      {
        id: 1,
        itemName: 'iPhone 15 Pro Max',
        ticketsSold: 87,
        ticketsTotal: 100,
        endsIn: '2 days',
        revenue: 435000,
        status: 'active',
      },
      {
        id: 2,
        itemName: 'MacBook Pro 14"',
        ticketsSold: 45,
        ticketsTotal: 50,
        endsIn: '5 days',
        revenue: 360000,
        status: 'active',
      },
      {
        id: 3,
        itemName: 'PlayStation 5',
        ticketsSold: 55,
        ticketsTotal: 60,
        endsIn: '1 day',
        revenue: 330000,
        status: 'active',
      },
    ],
  };

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
      <ActiveRaffles raffles={data.activeRaffles} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={data.recentTransactions} />

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemHealth />
        <QuickActions />
      </div>
    </div>
  );
}
