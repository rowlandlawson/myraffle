import Link from 'next/link';

interface RecentItemCardProps {
  item: {
    id: number;
    name: string;
    image: string;
    price: number;
    progress: number;
  };
}

export default function RecentItemCard({ item }: RecentItemCardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{item.image}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <div className="text-sm text-gray-600">
            ₦{item.price.toLocaleString()} per ticket
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-red-600 to-red-700 h-full"
          style={{ width: `${item.progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>{item.progress}% sold</span>
        <Link
          href="#"
          className="text-red-600 font-semibold hover:text-red-700"
        >
          Buy →
        </Link>
      </div>
    </div>
  );
}
