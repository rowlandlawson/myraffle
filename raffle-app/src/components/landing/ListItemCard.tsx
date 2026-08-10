'use client';

import BlockProgressBar from '@/components/landing/BlockProgressBar';
import { resolveImageUrl } from '@/lib/imageUrl';

export interface ListItem {
  id: string | number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: string;
  endsIn?: string;
}

interface ListItemCardProps {
  item: ListItem;
  onViewDetails?: (item: any) => void;
}

export default function ListItemCard({ item, onViewDetails }: ListItemCardProps) {
  const imageUrl = resolveImageUrl(item.image);
  const ticketsLeft = Math.max(0, item.ticketsTotal - item.ticketsSold);

  return (
    <div
      className="flex gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer items-center"
      onClick={() => onViewDetails?.(item)}
    >
      {/* Square Thumbnail Container */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-red-600 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden shadow-sm">
        {/* Small badge on top right */}
        <div className="absolute top-1 right-1 text-[8px] font-black text-slate-950 bg-yellow-400 px-1 rounded">
          LIVE
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow"
          />
        ) : (
          <div className="text-3xl">📦</div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        {/* Tickets Left Stats */}
        <div className="flex items-center gap-1.5 text-xs mb-0.5 flex-wrap">
          <span className="text-red-600 font-black text-sm">{ticketsLeft}</span>
          <span className="font-extrabold text-gray-900 text-xs">LEFT</span>
          <span className="text-gray-300 font-light">|</span>
          <span className="text-gray-400 font-semibold text-[11px]">OUT OF</span>
          <span className="font-extrabold text-gray-900 text-xs">{item.ticketsTotal}</span>
        </div>

        {/* 10-Block Progress Bar */}
        <BlockProgressBar
          ticketsSold={item.ticketsSold}
          ticketsTotal={item.ticketsTotal}
        />

        {/* Item Title */}
        <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 truncate mb-1">
          {item.name}
        </h4>

        {/* Price Tag */}
        <div>
          <span className="text-red-600 font-extrabold text-sm sm:text-base">
            {item.ticketPrice.toLocaleString()} NGN
          </span>
          <span className="text-gray-400 text-xs font-semibold ml-1">/ticket</span>
        </div>
      </div>
    </div>
  );
}
