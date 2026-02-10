import { Item } from '@/types/items';

interface ItemsStatsProps {
  items: Item[];
}

export default function ItemsStats({ items }: ItemsStatsProps) {
  const totalItems = items.length;
  const activeItems = items.filter((i) => i.status === 'active').length;
  const completedItems = items.filter((i) => i.status === 'completed').length;

  const totalRevenue = items.reduce(
    (sum, item) => sum + item.ticketPrice * item.ticketsSold,
    0,
  );

  const stats = [
    {
      label: 'Total Items',
      value: totalItems,
      color: 'text-gray-900',
    },
    {
      label: 'Active',
      value: activeItems,
      color: 'text-green-600',
    },
    {
      label: 'Completed',
      value: completedItems,
      color: 'text-gray-600',
    },
    {
      label: 'Total Revenue',
      value: `₦${(totalRevenue / 1000000).toFixed(2)}M`,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 font-semibold mb-2">{stat.label}</p>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
