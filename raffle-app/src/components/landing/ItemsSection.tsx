'use client';

import Link from 'next/link';
import { ChevronRight, Flame, Trophy } from 'lucide-react';
import RaffleCard from '@/components/landing/RaffleCard';

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
}

export default function ItemsSection({
  items,
  activeTab,
  onTabChange,
  isAuthenticated,
}: ItemsSectionProps) {
  const activeItems = items.filter((item) => item.status === 'active');
  const completedItems = items.filter((item) => item.status === 'completed');
  const displayItems = activeTab === 'active' ? activeItems : completedItems;

  return (
    <section id="items" className="py-8 sm:py-12 px-4 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Raffle Draws
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pick your favourite item and stand a chance to win
            </p>
          </div>
          <Link
            href="/items"
            className="flex items-center gap-1.5 text-red-600 font-semibold text-sm hover:text-red-700 transition-colors group"
          >
            View All
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => onTabChange('active')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'active'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
              }`}
          >
            <Flame size={14} />
            Live ({activeItems.length})
          </button>
          <button
            onClick={() => onTabChange('completed')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'completed'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
              }`}
          >
            <Trophy size={14} />
            Completed ({completedItems.length})
          </button>
        </div>

        {/* Items Grid — denser on desktop */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayItems.map((item) => (
              <RaffleCard
                key={item.id}
                item={item}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎰</div>
            <p className="text-gray-500 font-medium">
              {activeTab === 'active'
                ? 'No active raffles right now. Check back soon!'
                : 'No completed raffles yet.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

