import StatCard from '@/components/ui/StatCard';
import { DollarSign, Gift, TrendingUp, Users } from 'lucide-react';

interface StatsData {
  totalRevenue: number;
  revenueThisMonth: number;
  totalUsers: number;
  activeUsers: number;
  totalRaffles: number;
  activeRaffles: number;
  totalTicketsSold: number;
  winnersThisMonth: number;
}

interface StatsGridProps {
  stats: StatsData;
}

const formatRevenue = (amount: number) => {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(2)}M`;
  }
  return `₦${amount.toLocaleString('en-NG')}`;
};

export default function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      title: 'Total Revenue',
      value: formatRevenue(stats.totalRevenue),
      subtitle: `This month: ${formatRevenue(stats.revenueThisMonth)}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      subtitle: `Active: ${stats.activeUsers.toLocaleString()}`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Raffles',
      value: stats.totalRaffles.toString(),
      subtitle: `Active: ${stats.activeRaffles}`,
      icon: Gift,
      color: 'purple',
    },
    {
      title: 'Tickets Sold',
      value: stats.totalTicketsSold.toLocaleString(),
      subtitle: `Winners this month: ${stats.winnersThisMonth}`,
      icon: TrendingUp,
      color: 'orange',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {statCards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
