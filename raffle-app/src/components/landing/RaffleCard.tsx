'use client';

import { resolveImageUrl } from '@/lib/imageUrl';
import { Clock, Ticket, Users } from 'lucide-react';

interface RaffleItem {
  id: string | number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
}

interface RaffleCardProps {
  item: RaffleItem;
  isAuthenticated: boolean;
  onViewDetails?: (item: RaffleItem) => void;
}

export default function RaffleCard({
  item,
  isAuthenticated: _isAuthenticated,
  onViewDetails,
}: RaffleCardProps) {
  const progressPercent = Math.min(100, Math.round((item.ticketsSold / item.ticketsTotal) * 100));
  const imageUrl = resolveImageUrl(item.image);
  const ticketsRemaining = item.ticketsTotal - item.ticketsSold;

  const handleClick = () => {
    if (onViewDetails) onViewDetails(item);
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-0.5 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-44 sm:h-48 bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            {item.image || '📦'}
          </div>
        )}

        {/* Status badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
            item.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-700/80 text-white'
          }`}
        >
          {item.status === 'active' && (
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          )}
          {item.status === 'active' ? 'LIVE' : 'ENDED'}
        </div>

        {/* Countdown */}
        {item.status === 'active' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white text-gray-700 text-xs font-semibold rounded-full shadow-sm">
            <Clock size={11} className="text-[#E10600]" />
            {item.endsIn}
          </div>
        )}

        {/* Price tag overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between">
          <span className="text-white font-black text-base">
            ₦{item.ticketPrice.toLocaleString()}
            <span className="text-white/70 font-normal text-xs ml-1">/ticket</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 truncate">{item.name}</h3>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={11} />
              {item.ticketsSold.toLocaleString()} sold
            </span>
            <span className="font-semibold text-gray-900">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#E10600] transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
            <Ticket size={10} />
            {ticketsRemaining.toLocaleString()} ticket
            {ticketsRemaining !== 1 ? 's' : ''} left
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full py-2.5 text-sm font-bold text-[#E10600] border border-[#E10600] rounded-xl hover:bg-[#E10600] hover:text-white transition-colors active:scale-[0.98]"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
