import { ReactNode } from 'react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  borderColor: string;
  iconBgColor: string;
  primaryAction?: {
    label: string;
    href: string;
    variant: 'primary' | 'secondary' | 'muted';
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  borderColor,
  iconBgColor,
  primaryAction,
  secondaryAction,
}: StatCardProps) {
  const getActionStyles = (variant: 'primary' | 'secondary' | 'muted') => {
    switch (variant) {
      case 'primary':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'secondary':
        return 'border-2 border-red-600 text-red-600 hover:bg-red-50';
      case 'muted':
        return 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100';
      default:
        return 'bg-blue-50 text-blue-600 hover:bg-blue-100';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-semibold">{title}</h3>
        <div
          className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>

      {(primaryAction || secondaryAction) && (
        <div className="flex gap-2">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition text-sm text-center ${getActionStyles(primaryAction.variant)}`}
            >
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="flex-1 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition text-sm text-center"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
