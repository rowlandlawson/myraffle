'use client';

import Link from 'next/link';
import { ChevronRight, Flame, Trophy, Clock, Users, Ticket } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageUrl';
import { convertNairaToPoints } from '@/lib/constants';
import RafflePointsIcon from '@/components/ui/RafflePointsIcon';

interface Item {
  id: number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
}

interface ItemsSectionProps {
  items: Item[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAuthenticated: boolean;
  onViewDetails?: (item: Item) => void;
}

export default function ItemsSection({
  items,
  activeTab,
  onTabChange,
  isAuthenticated,
  onViewDetails,
}: ItemsSectionProps) {
  const activeItems = items.filter((item) => item.status === 'active');
  const completedItems = items.filter((item) => item.status === 'completed');
  const displayItems = activeTab === 'active' ? activeItems : completedItems;

  return (
    <section id="items" className="pt-6 pb-4">
      <div className="px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-gray-900">
            {activeTab === 'active' ? '🔥 Live Raffles' : '🏆 Completed'}
          </h2>
          <Link
            href="/items"
            className="flex items-center gap-1 text-red-600 font-semibold text-sm hover:text-red-700 transition-colors"
          >
            View All
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onTabChange('active')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'active'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Flame size={12} />
            Live ({activeItems.length})
          </button>
          <button
            onClick={() => onTabChange('completed')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'completed'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Trophy size={12} />
            Completed ({completedItems.length})
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Items */}
      {displayItems.length > 0 ? (
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
            {displayItems.map((item) => {
              const imageUrl = resolveImageUrl(item.image);
              const progress = Math.round(
                (item.ticketsSold / item.ticketsTotal) * 100,
              );
              const pointsPrice = convertNairaToPoints(item.ticketPrice);

              return (
                <div
                  key={item.id}
                  className="w-44 sm:w-52 flex-none bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  onClick={() => onViewDetails?.(item)}
                >
                  {/* Image */}
                  <div className="relative h-32 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-5xl">
                        📦
                      </div>
                    )}

                    {/* Status */}
                    {item.status === 'active' ? (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-800/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                        ENDED
                      </div>
                    )}

                    {/* Timer */}
                    {item.status === 'active' && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold rounded-full">
                        <Clock size={10} className="text-red-500" />
                        {item.endsIn}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate mb-2">
                      {item.name}
                    </h3>

                    {/* Progress */}
                    <div className="mb-2.5">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {item.ticketsSold}/{item.ticketsTotal}
                        </span>
                        <span className="text-[10px] font-bold text-red-600">{progress}%</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-bold text-gray-900">
                        <RafflePointsIcon size={12} className="text-amber-500" />
                        {pointsPrice.toLocaleString()} pts
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium flex items-center gap-0.5">
                        <Ticket size={9} />
                        {item.ticketsTotal - item.ticketsSold} left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="text-4xl mb-3">🎰</div>
          <p className="text-gray-500 text-sm font-medium">
            {activeTab === 'active'
              ? 'No active raffles right now. Check back soon!'
              : 'No completed raffles yet.'}
          </p>
        </div>
      )}

      {/* No scrollbar CSS */}
      <style>{`
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
