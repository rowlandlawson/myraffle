'use client';

import { useState } from 'react';
import TopNav from '@/components/navbar/TopNav';
import { useRaffles } from '@/lib/hooks/useRaffles';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ItemsSection from '@/components/landing/ItemsSection';
import WinnersSection from '@/components/landing/WinnersSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import BottomNav from '@/components/navbar/BottomNav';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('active');

  // Fetch live raffles
  const { data: activeData, isLoading: activeLoading } = useRaffles({ status: 'ACTIVE' });
  const { data: completedData, isLoading: completedLoading } = useRaffles({ status: 'COMPLETED' });
  const activeRaffles = activeData?.raffles ?? [];
  const completedRaffles = completedData?.raffles ?? [];

  // Map API data to the format ItemsSection expects
  const mapRaffleToItem = (r: any) => {
    const now = new Date();
    const raffleEnd = new Date(r.raffleDate);
    const daysLeft = Math.max(0, Math.ceil((raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const imageUrl = r.item.imageUrl?.startsWith('/uploads')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${r.item.imageUrl}`
      : r.item.imageUrl || '📦';

    return {
      id: r.id,
      name: r.item.name,
      image: imageUrl,
      ticketPrice: r.ticketPrice,
      ticketsSold: r.ticketsSold,
      ticketsTotal: r.ticketsTotal,
      status: r.status.toLowerCase() as 'active' | 'completed',
      endsIn: r.status === 'COMPLETED' ? 'Completed' : `${daysLeft} days`,
    };
  };

  const activeItems = activeRaffles.map(mapRaffleToItem);
  const completedItems = completedRaffles.map(mapRaffleToItem);

  // For landing page, we'll combine them since ItemsSection filters by status itself
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
    <div className="min-h-screen bg-white">
      <TopNav />
      <HeroSection />
      <FeaturesSection />
      <ItemsSection
        items={items}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <WinnersSection winners={recentWinners} />
      <HowItWorksSection />
      <CTASection />
      <BottomNav />
      <Footer />
    </div>
  );
}
