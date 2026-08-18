'use client';

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
import { useCompleteTask, useCompletedTasks, useTasks } from '@/lib/hooks/useTasks';
import { resolveImageUrl } from '@/lib/imageUrl';
import { ChevronDown, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';

const DESKTOP_PAGE_SIZE = 8;
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
}

function mapRaffleToItem(r: ApiRaffle): RaffleItem {
  const now = new Date();
  const raffleEnd = new Date(r.raffleDate);
  const daysLeft = Math.max(
    0,
    Math.ceil((raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
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
}

export default function DashboardHome() {
  const { user, isAuthenticated } = useAuthStore();
  const [selectedItem, setSelectedItem] = useState<RaffleItem | null>(null);
  const [desktopVisible, setDesktopVisible] = useState(DESKTOP_PAGE_SIZE);
  const [mobileVisible, setMobileVisible] = useState(MOBILE_PAGE_SIZE);

  const {
    data: activeData,
    isPending: isPendingActive,
    isLoading: isLoadingActive,
  } = useRaffles({ status: 'ACTIVE' });
  const { data: completedDataRaffles } = useRaffles({ status: 'COMPLETED' });
  const completedRaffles = completedDataRaffles?.raffles || [];
  const isRafflesLoading = isPendingActive || isLoadingActive;

  const allItems = useMemo(() => (activeData?.raffles || []).map(mapRaffleToItem), [activeData]);
  const desktopItems = allItems.slice(0, desktopVisible);
  const hasMoreDesktop = desktopVisible < allItems.length;
  const mobileItems = allItems.slice(0, mobileVisible);
  const hasMoreMobile = mobileVisible < allItems.length;

  // Daily Login Reward Automation
  const { data: tasks = [] } = useTasks();
  const { data: completedData } = useCompletedTasks();
  const completeTaskMutation = useCompleteTask();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dailyLoginAttempted = useRef(false);

  useEffect(() => {
    if (tasks.length === 0 || !completedData || dailyLoginAttempted.current) return;

    const completedTaskIds = new Set((completedData?.completedTasks ?? []).map((ct) => ct.taskId));
    const dailyTask = tasks.find((t) => t.type === 'DAILY_LOGIN');
    if (dailyTask && !dailyTask.completedToday && !completedTaskIds.has(dailyTask.id)) {
      dailyLoginAttempted.current = true;
      completeTaskMutation.mutate(dailyTask.id, {
        onSuccess: () => {
          setToastMessage(
            `Welcome back, ${user?.name?.split(' ')[0] || 'User'}! Daily login reward claimed ✓`,
          );
          setTimeout(() => setToastMessage(null), 4000);
        },
      });
    }
  }, [tasks, completedData, user?.name, completeTaskMutation]);

  // Recent winners
  const _items = allItems;

  const recentWinners = completedRaffles.map((r: ApiRaffle, idx: number) => ({
    id: idx + 1,
    userNumber: r.winner?.name || r.winner?.userNumber || `USER-${String(r.id).slice(0, 5)}`,
    itemName: r.item?.name || 'Raffle Item',
    date: new Date(r.raffleDate).toLocaleDateString(),
  }));

  if (isRafflesLoading) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center space-y-6 rounded-3xl my-4 py-16">
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
    <div className="space-y-8 pb-20 md:pb-0">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* DESKTOP CONTENT VIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-8">
        {/* Live Raffle Draws Section */}
        <section id="items" className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Live Raffle Draws</h2>
              <p className="text-gray-600 text-sm mt-1">
                Choose an item to view details and enter the raffle draw.
              </p>
            </div>
          </div>

          {allItems.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {desktopItems.map((item: RaffleItem) => (
                  <RaffleCard
                    key={item.id}
                    item={item}
                    isAuthenticated={isAuthenticated}
                    onViewDetails={(selected: RaffleItem) => setSelectedItem(selected)}
                  />
                ))}
              </div>

              {hasMoreDesktop && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <p className="text-sm text-gray-400">
                    Showing {desktopVisible} of {allItems.length} draws
                  </p>
                  <button
                    onClick={() => setDesktopVisible((v) => v + DESKTOP_PAGE_SIZE)}
                    className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#E10600] hover:text-[#E10600] transition-colors bg-white"
                  >
                    <ChevronDown size={16} />
                    Load More Draws
                  </button>
                </div>
              )}
              {!hasMoreDesktop && allItems.length > DESKTOP_PAGE_SIZE && (
                <p className="mt-8 text-center text-sm text-gray-400">
                  All {allItems.length} draws loaded
                </p>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="text-5xl mb-3">🎰</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Raffles Available</h3>
              <p className="text-gray-500 text-sm">Check back soon for new raffle draws!</p>
            </div>
          )}
        </section>

        <FeaturesSection />
        {recentWinners.length > 0 && <WinnersSection winners={recentWinners} />}
        <HowItWorksSection />
        <Footer />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MOBILE CONTENT VIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        <main className="py-2">
          <ItemsSection
            items={mobileItems}
            completedRaffles={completedRaffles}
            onViewDetails={(item) => setSelectedItem(item as unknown as RaffleItem)}
          />
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
