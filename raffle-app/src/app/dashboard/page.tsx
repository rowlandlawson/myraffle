'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRaffles, ApiRaffle } from '@/lib/hooks/useRaffles';
import { useTasks, useCompletedTasks, useCompleteTask } from '@/lib/hooks/useTasks';
import { resolveImageUrl } from '@/lib/imageUrl';
import ItemsSection from '@/components/landing/ItemsSection';
import RaffleCard from '@/components/landing/RaffleCard';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WinnersSection from '@/components/landing/WinnersSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import ItemBottomSheet from '@/components/shared/ItemBottomSheet';
import { Loader2 } from 'lucide-react';

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

export default function DashboardHome() {
  const { user, isAuthenticated } = useAuthStore();
  const [selectedItem, setSelectedItem] = useState<RaffleItem | null>(null);

  // Fetch live active raffles from backend API
  const { data: activeData, isPending: isPendingActive, isLoading: isLoadingActive } = useRaffles({ status: 'ACTIVE' });
  const activeRaffles = activeData?.raffles || [];

  // Fetch completed winner raffles directly from database API
  const { data: completedDataRaffles } = useRaffles({ status: 'COMPLETED' });
  const completedRaffles = completedDataRaffles?.raffles || [];

  const isRafflesLoading = isPendingActive || isLoadingActive;

  // Daily Login Reward Automation
  const { data: tasks = [] } = useTasks();
  const { data: completedData } = useCompletedTasks();
  const completeTaskMutation = useCompleteTask();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dailyLoginAttempted = useRef(false);

  const completedTaskIds = new Set(
    (completedData?.completedTasks ?? []).map((ct) => ct.taskId)
  );

  useEffect(() => {
    if (tasks.length === 0 || !completedData || dailyLoginAttempted.current) return;

    const dailyTask = tasks.find((t) => t.type === 'DAILY_LOGIN');
    if (dailyTask && !dailyTask.completedToday && !completedTaskIds.has(dailyTask.id)) {
      dailyLoginAttempted.current = true;
      completeTaskMutation.mutate(dailyTask.id, {
        onSuccess: () => {
          setToastMessage(`Welcome back, ${user?.name?.split(' ')[0] || 'User'}! +${dailyTask.points || 25} points claimed for daily login`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, completedData]);

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

  const recentWinners = completedRaffles.map((r: ApiRaffle, idx: number) => ({
    id: idx + 1,
    userNumber: r.winner?.name || r.winner?.userNumber || `USER-${String(r.id).slice(0, 5)}`,
    itemName: r.item?.name || 'Raffle Item',
    date: new Date(r.raffleDate).toLocaleDateString(),
  }));

  if (isRafflesLoading) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center space-y-4 rounded-3xl my-4">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          my<span className="text-red-600">Raffle</span>
        </h1>
        <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* DESKTOP CONTENT VIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-8">
        {/* Live Raffle Draws Section */}
        <section id="items" className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
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
      {/* MOBILE CONTENT VIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        <main className="py-2">
          <ItemsSection
            items={items}
            completedRaffles={completedRaffles}
            onViewDetails={(item: RaffleItem) => setSelectedItem(item)}
          />
        </main>
      </div>

      {/* Item Detail Bottom Sheet */}
      <ItemBottomSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isAuthenticated={isAuthenticated}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex items-center gap-2">
          <span>🎉</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
