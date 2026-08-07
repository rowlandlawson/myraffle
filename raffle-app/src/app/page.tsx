'use client';

import { useState } from 'react';
import TopNav from '@/components/navbar/TopNav';
import { useAuthStore } from '@/lib/authStore';
import { useRaffles } from '@/lib/hooks/useRaffles';
import BalanceCard from '@/components/landing/BalanceCard';
import HeroBanner from '@/components/landing/HeroBanner';
import ItemsSection from '@/components/landing/ItemsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WinnersSection from '@/components/landing/WinnersSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import BottomNav from '@/components/navbar/BottomNav';
import ItemBottomSheet from '@/components/shared/ItemBottomSheet';
import { resolveImageUrl } from '@/lib/imageUrl';

interface RaffleItem {
  id: number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedItem, setSelectedItem] = useState<RaffleItem | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  // Fetch live raffles
  const {
    data: activeData,
    isLoading: activeLoading,
    error: activeError,
  } = useRaffles({ status: 'ACTIVE' });
  const {
    data: completedData,
    isLoading: completedLoading,
    error: completedError,
  } = useRaffles({ status: 'COMPLETED' });
  const activeRaffles = activeData?.raffles || [];
  const completedRaffles = completedData?.raffles || [];

  // Map API data to the format ItemsSection expects
  const mapRaffleToItem = (r: any): RaffleItem => {
    const now = new Date();
    const raffleEnd = new Date(r.raffleDate);
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const imageUrl = resolveImageUrl(r.item.imageUrl) || '\u{1F4E6}';

    return {
      id: r.id,
      name: r.item.name,
      image: imageUrl,
      ticketPrice: r.ticketPrice,
      ticketsSold: r.ticketsSold,
      ticketsTotal: r.ticketsTotal,
      status:
        r.status === 'ACTIVE' || r.status === 'SCHEDULED'
          ? ('active' as const)
          : ('completed' as const),
      endsIn: r.status === 'COMPLETED' ? 'Completed' : `${daysLeft} days`,
    };
  };

  const activeItems = activeRaffles.map(mapRaffleToItem);
  const completedItems = completedRaffles.map(mapRaffleToItem);
  const items = [...activeItems, ...completedItems];

  // Mock data for winners
  const recentWinners = [
    {
      id: 1,
      userNumber: 'USER-98765',
      itemName: 'iPhone 15 Pro Max',
      date: '2 hours ago',
    },
    {
      id: 2,
      userNumber: 'USER-54321',
      itemName: 'MacBook Pro 14"',
      date: '5 hours ago',
    },
    {
      id: 3,
      userNumber: 'USER-11223',
      itemName: 'AirPods Pro Max',
      date: '1 day ago',
    },
    {
      id: 4,
      userNumber: 'USER-44556',
      itemName: 'PlayStation 5',
      date: '2 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App-Style Top Nav */}
      <TopNav />

      {/* Balance Card (like reference image) */}
      <BalanceCard
        isAuthenticated={isAuthenticated}
        walletBalance={user?.walletBalance ?? 0}
        rafflePoints={user?.rafflePoints ?? 0}
      />

      {/* Hero Banner Carousel (like reference image) */}
      <HeroBanner isAuthenticated={isAuthenticated} />

      {/* Horizontal Scrollable Items */}
      <ItemsSection
        items={items}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAuthenticated={isAuthenticated}
        onViewDetails={(item) => setSelectedItem(item)}
      />

      {/* Features */}
      <FeaturesSection />

      {/* Recent Winners Ticker */}
      <WinnersSection winners={recentWinners} />

      {/* How It Works */}
      <HowItWorksSection />

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Bottom Navigation (mobile) */}
      <BottomNav />

      {/* Item Detail Bottom Sheet Modal */}
      <ItemBottomSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
