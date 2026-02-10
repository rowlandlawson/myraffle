'use client';

import { useState } from 'react';
import TopNav from '@/components/navbar/TopNav';
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

  // Mock data for items
  const items = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      image: '📱',
      ticketPrice: 5000,
      ticketsSold: 87,
      ticketsTotal: 100,
      status: 'active' as const,
      endsIn: '2 days',
    },
    {
      id: 2,
      name: 'MacBook Pro 14"',
      image: '💻',
      ticketPrice: 8000,
      ticketsSold: 45,
      ticketsTotal: 50,
      status: 'active' as const,
      endsIn: '5 days',
    },
    {
      id: 3,
      name: 'AirPods Pro Max',
      image: '🎧',
      ticketPrice: 3000,
      ticketsSold: 92,
      ticketsTotal: 100,
      status: 'active' as const,
      endsIn: '1 day',
    },
    {
      id: 4,
      name: 'PlayStation 5',
      image: '🎮',
      ticketPrice: 6000,
      ticketsSold: 100,
      ticketsTotal: 100,
      status: 'completed' as const,
      endsIn: 'Completed',
    },
    {
      id: 5,
      name: 'Apple Watch Ultra',
      image: '⌚',
      ticketPrice: 2500,
      ticketsSold: 60,
      ticketsTotal: 80,
      status: 'active' as const,
      endsIn: '3 days',
    },
    {
      id: 6,
      name: 'iPad Pro 12.9"',
      image: '📲',
      ticketPrice: 4500,
      ticketsSold: 75,
      ticketsTotal: 100,
      status: 'active' as const,
      endsIn: '4 days',
    },
  ];

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
