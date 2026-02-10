import { ReactNode } from 'react';

interface TicketStatCardProps {
  title: string;
  count: number;
  subtitle: string;
  borderColor: string;
  textColor: string;
}

export default function TicketStatCard({
  title,
  count,
  subtitle,
  borderColor,
  textColor,
}: TicketStatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${borderColor}`}>
      <h3 className="text-gray-600 font-semibold mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${textColor}`}>{count}</div>
      <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}
