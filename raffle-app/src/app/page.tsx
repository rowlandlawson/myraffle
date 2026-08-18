'use client';

import BannerSlider from '@/components/landing/BannerSlider';
import CTASection from '@/components/landing/CTASection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import Footer from '@/components/landing/Footer';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import ItemsSection from '@/components/landing/ItemsSection';
import RaffleCard from '@/components/landing/RaffleCard';
import WinnersSection from '@/components/landing/WinnersSection';
import ItemBottomSheet from '@/components/shared/ItemBottomSheet';
import { useAuthStore } from '@/lib/authStore';
import { type ApiRaffle, useRaffles } from '@/lib/hooks/useRaffles';
import { resolveImageUrl } from '@/lib/imageUrl';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

// How many items to show per "page" on the desktop grid
const DESKTOP_PAGE_SIZE = 8;
// How many items to show initially on mobile (featured + list)
const MOBILE_PAGE_SIZE = 5;

interface RaffleItem {
  id: string | number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
  raffleDate?: string | Date;
}

function mapRaffleToItem(r: ApiRaffle): RaffleItem {
  const now = new Date();
  const raffleEnd = new Date(r.raffleDate);
  const daysLeft = Math.max(
    0,
    Math.ceil((raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  return {
    id: String(r.id),
    name: r.item?.name || 'Raffle Draw',
    image: resolveImageUrl(r.item?.imageUrl) || '',
    ticketPrice: r.ticketPrice,
    ticketsSold: r.ticketsSold,
    ticketsTotal: r.ticketsTotal,
    status: r.status === 'COMPLETED' ? 'completed' : 'active',
    endsIn: r.status === 'COMPLETED' ? 'Completed' : `${daysLeft} days`,
    raffleDate: r.raffleDate,
  };
}

export default function LandingPage() {
  const [selectedItem, setSelectedItem] = useState<RaffleItem | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Desktop: track how many items to show (starts at DESKTOP_PAGE_SIZE)
  const [desktopVisible, setDesktopVisible] = useState(DESKTOP_PAGE_SIZE);
  // Mobile: track how many items to show
  const [mobileVisible, setMobileVisible] = useState(MOBILE_PAGE_SIZE);

  // Fetch all active raffles once (backend default limit is usually 100, enough)
  const { data: activeData, isPending, isFetching } = useRaffles({ status: 'ACTIVE' });
  const { data: completedData } = useRaffles({ status: 'COMPLETED' });

  const allItems = useMemo(() => (activeData?.raffles || []).map(mapRaffleToItem), [activeData]);

  const completedRaffles = completedData?.raffles || [];

  const recentWinners = completedRaffles.map((r: ApiRaffle, idx: number) => ({
    id: idx + 1,
    userNumber: r.winner?.name || r.winner?.userNumber || `USER-${String(r.id).slice(0, 5)}`,
    itemName: r.item?.name || 'Raffle Item',
    date: new Date(r.raffleDate).toLocaleDateString(),
  }));

  // Sliced views
  const desktopItems = allItems.slice(0, desktopVisible);
  const hasMoreDesktop = desktopVisible < allItems.length;

  const mobileItems = allItems.slice(0, mobileVisible);
  const hasMoreMobile = mobileVisible < allItems.length;

  if (isPending) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center space-y-6">
        <img
          src="/images/logo.png"
          alt="myRaffle Loading"
          className="h-28 md:h-36 w-auto object-contain animate-pulse"
        />
        <Loader2 className="w-8 h-8 text-[#E10600] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* ── DESKTOP ─────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <BannerSlider />

        <section id="items" className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#E10600] uppercase tracking-widest mb-2">
                Active now
              </p>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Live Raffle Draws
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Pick an item, grab your ticket, and enter the draw.
              </p>
            </div>
            {allItems.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {allItems.length} active draw{allItems.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {allItems.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {desktopItems.map((item: RaffleItem) => (
                  <RaffleCard
                    key={item.id}
                    item={item}
                    isAuthenticated={isAuthenticated}
                    onViewDetails={(selected) => setSelectedItem(selected)}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMoreDesktop && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <p className="text-sm text-gray-400">
                    Showing {desktopVisible} of {allItems.length} draws
                  </p>
                  <button
                    onClick={() => setDesktopVisible((v) => v + DESKTOP_PAGE_SIZE)}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#E10600] hover:text-[#E10600] transition-colors bg-white disabled:opacity-50"
                  >
                    {isFetching ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    Load More Draws
                  </button>
                </div>
              )}

              {/* All loaded indicator */}
              {!hasMoreDesktop && allItems.length > DESKTOP_PAGE_SIZE && (
                <div className="mt-8 text-center text-sm text-gray-400">
                  All {allItems.length} draws loaded
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="text-5xl mb-3">🎰</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Raffles</h3>
              <p className="text-gray-500 text-sm">Check back soon for new raffle draws!</p>
            </div>
          )}
        </section>

        <FeaturesSection />
        {recentWinners.length > 0 && <WinnersSection winners={recentWinners} />}
        <HowItWorksSection />
        <Footer />
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────── */}
      <div className="md:hidden">
        <BannerSlider />
        <main className="py-4">
          <ItemsSection
            items={mobileItems}
            completedRaffles={completedRaffles}
            onViewDetails={(item) => setSelectedItem(item as RaffleItem)}
          />

          {/* Mobile Load More */}
          {hasMoreMobile && (
            <div className="px-4 pb-6 pt-2 flex flex-col items-center gap-2">
              <p className="text-xs text-gray-400">
                Showing {mobileVisible} of {allItems.length}
              </p>
              <button
                onClick={() => setMobileVisible((v) => v + MOBILE_PAGE_SIZE)}
                className="w-full max-w-xs py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:border-[#E10600] hover:text-[#E10600] transition-colors bg-white flex items-center justify-center gap-2"
              >
                <ChevronDown size={16} />
                Show More Draws
              </button>
            </div>
          )}

          {!hasMoreMobile && allItems.length > MOBILE_PAGE_SIZE && (
            <p className="text-center text-xs text-gray-400 pb-6">
              You&apos;ve seen all {allItems.length} draws
            </p>
          )}
        </main>
      </div>

      <ItemBottomSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
