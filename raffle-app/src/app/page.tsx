'use client';

import { useState } from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import TopNav from '@/components/navbar/TopNav';
import RaffleCard from '@/components/landing/RaffleCard';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WinnersSection from '@/components/landing/WinnersSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import ItemsSection from '@/components/landing/ItemsSection';
import BottomNav from '@/components/navbar/BottomNav';
import ItemBottomSheet from '@/components/shared/ItemBottomSheet';
import { useAuthStore } from '@/lib/authStore';
import { useRaffles, ApiRaffle } from '@/lib/hooks/useRaffles';
import { resolveImageUrl } from '@/lib/imageUrl';
import { Loader2 } from 'lucide-react';

import BannerSlider from '@/components/landing/BannerSlider';

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

export default function LandingPage() {
  const [selectedItem, setSelectedItem] = useState<RaffleItem | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Fetch live active raffles from backend API
  const { data: activeData, isPending: isPendingActive, isLoading: isLoadingActive } = useRaffles({ status: 'ACTIVE' });
  const activeRaffles = activeData?.raffles || [];

  // Fetch completed winner raffles directly from database API
  const { data: completedData } = useRaffles({ status: 'COMPLETED' });
  const completedRaffles = completedData?.raffles || [];

  const isRafflesLoading = isPendingActive || isLoadingActive;

  // Map API data to RaffleItem format
  const mapRaffleToItem = (r: ApiRaffle): RaffleItem => {
    const now = new Date();
    const raffleEnd = new Date(r.raffleDate);
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const imageUrl = resolveImageUrl(r.item?.imageUrl) || '';

    return {
      id: String(r.id),
      name: r.item?.name || 'Raffle Draw',
      image: imageUrl,
      ticketPrice: r.ticketPrice,
      ticketsSold: r.ticketsSold,
      ticketsTotal: r.ticketsTotal,
      status: r.status === 'COMPLETED' ? 'completed' : 'active',
      endsIn: r.status === 'COMPLETED' ? 'Completed' : `${daysLeft} days`,
    };
  };

  const items = activeRaffles.map(mapRaffleToItem);

  // Recent winners ticker format
  const recentWinners = completedRaffles.map((r: ApiRaffle, idx: number) => ({
    id: idx + 1,
    userNumber: r.winner?.name || r.winner?.userNumber || `USER-${String(r.id).slice(0, 5)}`,
    itemName: r.item?.name || 'Raffle Item',
    date: new Date(r.raffleDate).toLocaleDateString(),
  }));

  // MINIMALIST CLEAN WHITE LOADING SCREEN WHILE FETCHING
  if (isRafflesLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          my<span className="text-red-600">Raffle</span>
        </h1>
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. DESKTOP VIEW (Visible on medium and larger screens: md:block) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <LandingNavbar />
        <BannerSlider />

        {/* Desktop Items Grid */}
        <section id="items" className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Live Raffle Draws
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Choose an item to view details and enter the raffle draw.
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item: RaffleItem) => (
                <RaffleCard
                  key={item.id}
                  item={item}
                  isAuthenticated={isAuthenticated}
                  onViewDetails={(selected: RaffleItem) => setSelectedItem(selected)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="text-5xl mb-3">🎰</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No Active Raffles Available
              </h3>
              <p className="text-gray-500 text-sm">
                Check back soon for new raffle draws!
              </p>
            </div>
          )}
        </section>

        <FeaturesSection />
        {recentWinners.length > 0 && <WinnersSection winners={recentWinners} />}
        <HowItWorksSection />
        <CTASection />
        <Footer />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MOBILE VIEW (Visible strictly on mobile screens: md:hidden) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden">
        <TopNav />
        <BannerSlider />
        <main className="py-4">
          <ItemsSection
            items={items}
            completedRaffles={completedRaffles}
            onViewDetails={(item: RaffleItem) => setSelectedItem(item)}
          />
        </main>
      </div>

      {/* Item Detail Bottom Sheet (Reusable for both desktop and mobile) */}
      <ItemBottomSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
