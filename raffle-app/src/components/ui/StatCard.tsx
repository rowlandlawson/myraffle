import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
}

const colorMap = {
  green: { border: 'border-green-600', icon: 'text-green-600' },
  blue: { border: 'border-blue-600', icon: 'text-blue-600' },
  purple: { border: 'border-purple-600', icon: 'text-purple-600' },
  orange: { border: 'border-orange-600', icon: 'text-orange-600' },
  red: { border: 'border-red-600', icon: 'text-red-600' },
  yellow: { border: 'border-yellow-600', icon: 'text-yellow-600' },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={`bg-white rounded-xl shadow p-4 md:p-6 border-l-4 ${colors.border}`}
    >
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-gray-600 font-semibold text-sm md:text-base">
          {title}
        </h3>
        <Icon size={20} className={`${colors.icon} md:w-6 md:h-6`} />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
        {subtitle}
      </p>
    </div>
  );
}
