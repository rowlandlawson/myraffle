'use client';

import FeaturedRaffleCard from '@/components/landing/FeaturedRaffleCard';
import ListItemCard from '@/components/landing/ListItemCard';
import WinnersCarousel from '@/components/landing/WinnersCarousel';
import { ApiRaffle } from '@/lib/hooks/useRaffles';

interface Item {
  id: string | number;
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
  completedRaffles?: ApiRaffle[];
  isLoading?: boolean;
  onViewDetails?: (item: Item) => void;
}

export default function ItemsSection({
  items,
  completedRaffles = [],
  isLoading = false,
  onViewDetails,
}: ItemsSectionProps) {
  // Skeleton pre-loader when raffles are still loading from server
  if (isLoading) {
    return (
      <div className="space-y-6 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Featured Skeleton */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-56 bg-gray-200 rounded-2xl" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-12 bg-gray-200 rounded-2xl" />
        </div>

        {/* List Skeleton Grid */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 items-center p-3 border border-gray-100 rounded-2xl">
                <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0" />
                <div className="space-y-2 grow">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render all active items passed from backend
  const activeItems = items;

  if (activeItems.length === 0) {
    return (
      <div className="space-y-8 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm text-center">
          <div className="text-5xl mb-3">🎰</div>
          <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-1">
            No Active Raffles Available
          </h3>
          <p className="text-gray-500 text-xs md:text-sm font-semibold">
            The admin hasn't posted any active raffles yet. Please check back soon!
          </p>
        </div>
        {completedRaffles && completedRaffles.length > 0 && (
          <WinnersCarousel completedRaffles={completedRaffles} />
        )}
      </div>
    );
  }

  // Separate the first item as Featured and remaining as List items
  const featuredItem = activeItems[0];
  const listItems = activeItems.slice(1);

  return (
    <div className="space-y-8 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* FEATURED CAMPAIGN (First backend item posted by admin) */}
      <section>
        <h2 className="text-gray-900 font-extrabold text-lg sm:text-xl md:text-2xl uppercase mb-3 tracking-tight">
          FEATURED DRAW
        </h2>
        <FeaturedRaffleCard item={featuredItem} onViewDetails={onViewDetails} />
      </section>

      {/* AVAILABLE RAFFLE ITEMS */}
      {listItems.length > 0 && (
        <section className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-gray-900 font-extrabold text-lg sm:text-xl md:text-2xl uppercase mb-4 tracking-tight">
            AVAILABLE RAFFLES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {listItems.map((item) => (
              <ListItemCard key={item.id} item={item} onViewDetails={onViewDetails} />
            ))}
          </div>
        </section>
      )}

      {/* Red Separator Dot & Winners Carousel (Only if completed winners exist) */}
      {completedRaffles && completedRaffles.length > 0 && (
        <>
          <div className="flex justify-center py-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600" />
          </div>
          <WinnersCarousel completedRaffles={completedRaffles} />
        </>
      )}
    </div>
  );
}
