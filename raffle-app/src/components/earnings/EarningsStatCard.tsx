import { ReactNode } from 'react';
import { Zap, Award } from 'lucide-react';

interface EarningsStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  borderColor: string;
}

export default function EarningsStatCard({
  title,
  value,
  subtitle,
  icon,
  borderColor,
}: EarningsStatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow p-4 md:p-6 border-l-4 ${borderColor}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-600 font-semibold text-sm md:text-base">
          {title}
        </p>
        {icon}
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs md:text-sm text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}
