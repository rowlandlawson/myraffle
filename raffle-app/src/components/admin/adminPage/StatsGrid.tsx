import { TrendingUp, Users, Gift, DollarSign } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

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

export default function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      title: 'Total Revenue',
      value: `₦${(stats.totalRevenue / 1000000).toFixed(2)}M`,
      subtitle: `This month: ₦${(stats.revenueThisMonth / 1000000).toFixed(2)}M`,
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
