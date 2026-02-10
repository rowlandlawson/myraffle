import Link from 'next/link';

interface QuickActionCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  borderColor: string;
  iconBgColor: string;
}

export default function QuickActionCard({
  href,
  icon,
  title,
  description,
  borderColor,
  iconBgColor,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={`bg-white rounded-xl shadow p-6 hover:shadow-lg transition border-l-4 ${borderColor}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-16 h-16 ${iconBgColor} rounded-lg flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
}
