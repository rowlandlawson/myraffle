'use client';

import { ChevronRight } from 'lucide-react';
import { Item } from '@/types/publicItems';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
}

export default function ItemCard({ item, onViewDetails }: ItemCardProps) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group">
      {/* Image */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-40 flex items-center justify-center text-6xl group-hover:scale-110 transition">
        {item.image}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              {item.ticketsSold} / {item.ticketsTotal}
            </span>
            <span className="text-sm font-semibold text-red-600">
              {item.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-red-700 h-full transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-600">Price per ticket</p>
            <p className="text-xl font-bold text-gray-900">
              ₦{item.price.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Ends in</p>
            <p className="text-lg font-bold text-red-600">{item.endsIn}</p>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => onViewDetails(item)}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition flex items-center justify-center gap-2"
        >
          View Details <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
