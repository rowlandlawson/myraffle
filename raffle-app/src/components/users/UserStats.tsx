import { Users, CheckCircle, Ban, Wallet } from 'lucide-react';
import { StatsData } from '@/types/users';

interface UserStatsProps {
  stats: StatsData;
}

export default function UserStats({ stats }: UserStatsProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      borderColor: 'border-blue-600',
      textColor: 'text-gray-900',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: CheckCircle,
      color: 'green',
      borderColor: 'border-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Suspended',
      value: stats.suspendedUsers,
      icon: Ban,
      color: 'red',
      borderColor: 'border-red-600',
      textColor: 'text-red-600',
    },
    {
      title: 'Total Balance',
      value: `₦${(stats.totalWalletBalance / 1000000).toFixed(2)}M`,
      icon: Wallet,
      color: 'purple',
      borderColor: 'border-purple-600',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`bg-white rounded-xl shadow p-6 border-l-4 ${stat.borderColor}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Icon size={24} className={`text-${stat.color}-600`} />
              <p className="text-gray-600 font-semibold">{stat.title}</p>
            </div>
            <p className={`text-3xl font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
