'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DollarSign, Star, Ticket, ArrowRight, ShoppingBag, History } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';
import { useWalletTransactions, useWalletBalance } from '@/lib/hooks/useWallet';
import { useTicketHistory } from '@/lib/hooks/useTickets';
import { useRaffles } from '@/lib/hooks/useRaffles';
import { useTasks, useCompletedTasks, useCompleteTask } from '@/lib/hooks/useTasks';

// Skeleton Components
const ActiveTicketsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 sm:mt-0">
          <div className="text-right">
            <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="text-right">
            <div className="h-4 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const AvailableItemsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
          <div className="flex items-center gap-2 mt-1">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RecentTransactionsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between p-3 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-5 w-20 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default function DashboardHome() {
  const { user } = useAuthStore();

  const { data: walletData, isLoading: walletLoading } = useWalletBalance();
  const { data: txData, isLoading: txLoading } = useWalletTransactions(1, 5);
  const { data: ticketData, isLoading: ticketsLoading } = useTicketHistory();
  const { data: raffleData, isLoading: rafflesLoading } = useRaffles({ status: 'ACTIVE', limit: 4 });

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
          setToastMessage(`Welcome back! +${dailyTask.points || 25} points for daily login`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, completedData]);

  const ticketStats = ticketData?.stats ?? { total: 0, active: 0, won: 0, lost: 0 };
  const apiTickets = ticketData?.tickets ?? [];
  const activeRaffles = raffleData?.raffles ?? [];

  // Filter active tickets from history
  const activeTickets = apiTickets
    .filter(t => t.status === 'ACTIVE')
    .slice(0, 3)
    .map(t => {
      const now = new Date();
      const raffleEnd = new Date(t.raffle.raffleDate);
      const daysLeft = Math.max(0, Math.ceil((raffleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const imageUrl = t.raffle.item.imageUrl?.startsWith('/uploads')
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${t.raffle.item.imageUrl}`
        : t.raffle.item.imageUrl || '📦';

      return {
        id: t.id as any,
        item: t.raffle.item.name,
        image: imageUrl,
        ticketNumber: t.ticketNumber,
        purchaseDate: new Date(t.createdAt).toLocaleDateString(),
        status: t.status.toLowerCase(),
        endsIn: `${daysLeft} days`,
      };
    });

  // Map transactions
  const mapTxType = (type: string) => {
    const mapping: Record<string, 'deposit' | 'withdrawal' | 'purchase' | 'reward' | 'refund'> = {
      DEPOSIT: 'deposit',
      WITHDRAWAL: 'withdrawal',
      TICKET_PURCHASE: 'purchase',
      TASK_REWARD: 'reward',
      RAFFLE_WIN: 'reward',
      REFUND: 'refund',
    };
    return mapping[type] || 'deposit';
  };

  const recentTransactions = (txData?.transactions || []).map(tx => ({
    id: tx.id as any,
    type: mapTxType(tx.type),
    rawType: tx.type,
    description: tx.description || `${tx.type} transaction`,
    amount: tx.type === 'WITHDRAWAL' || tx.type === 'TICKET_PURCHASE' ? -tx.amount : tx.amount,
    date: new Date(tx.createdAt).toLocaleDateString(),
    status: tx.status === 'COMPLETED' ? 'completed' : 'pending' as const,
  }));

  // Map available items
  const availableItems = activeRaffles.map(r => {
    const progress = Math.min(100, Math.round((r.ticketsSold / r.ticketsTotal) * 100));
    const imageUrl = r.item.imageUrl?.startsWith('/uploads')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${r.item.imageUrl}`
      : r.item.imageUrl || '📦';

    return {
      id: r.id as any,
      name: r.item.name,
      image: imageUrl,
      price: r.ticketPrice,
      progress,
    };
  });

  // Removed global loader to allow instant render with skeletons

  // Helper for transaction icons
  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <DollarSign size={18} className="text-green-600" />;
      case 'withdrawal':
        return <DollarSign size={18} className="text-red-600" />;
      case 'purchase':
        return <ShoppingBag size={18} className="text-blue-600" />;
      case 'reward':
        return <Star size={18} className="text-yellow-500" />;
      default:
        return <History size={18} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-50 via-white to-red-50 rounded-2xl p-6 shadow-sm border border-red-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here’s what’s happening with your raffle activity today.
            </p>
          </div>
          <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">User Number</div>
            <div className="font-mono font-semibold text-gray-900">{user?.userNumber}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <div className="text-3xl font-bold text-gray-900 mt-1">
                {walletLoading ? (
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                ) : (
                  `₦${(walletData?.walletBalance ?? user?.walletBalance ?? 0).toLocaleString()}`
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Available balance</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <DollarSign size={20} className="text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => toast.error('Wallet is currently locked')}
              className="flex-1 text-center bg-gray-400 cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition"
            >
              Add Funds (Locked)
            </button>
            <button
              onClick={() => toast.error('Wallet is currently locked')}
              className="flex-1 text-center border border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400 rounded-lg py-2 text-sm font-medium transition"
            >
              Withdraw (Locked)
            </button>
          </div>
        </div>

        {/* Raffle Points */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Raffle Points</p>
              <div className="text-3xl font-bold text-gray-900 mt-1">
                {walletLoading ? (
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                ) : (
                  (walletData?.rafflePoints ?? user?.rafflePoints ?? 0).toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">1,000 points = ₦100 value</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <Star size={20} className="text-yellow-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/earnings"
              className="block text-center border border-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition"
            >
              Earn More Points
            </Link>
          </div>
        </div>

        {/* Active Tickets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Tickets</p>
              <div className="text-3xl font-bold text-gray-900 mt-1">
                {ticketsLoading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                ) : (
                  ticketStats.active
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Tickets in active raffles</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Ticket size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/tickets"
              className="block text-center border border-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition"
            >
              View All Tickets
            </Link>
          </div>
        </div>
      </div>

      {/* Active Tickets Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Active Tickets</h2>
          <Link
            href="/dashboard/tickets"
            className="text-red-600 text-sm font-medium hover:text-red-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {ticketsLoading ? (
          <ActiveTicketsSkeleton />
        ) : (
          <div className="space-y-4">
            {activeTickets.length > 0 ? (
              activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
                      {typeof ticket.image === 'string' && ticket.image.startsWith('http') ? (
                        <img src={ticket.image} alt={ticket.item} className="w-10 h-10 object-contain" />
                      ) : (
                        ticket.image
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{ticket.item}</p>
                      <p className="text-sm text-gray-500">Ticket #{ticket.ticketNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-3 sm:mt-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Purchased</p>
                      <p className="text-sm font-medium text-gray-900">{ticket.purchaseDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Ends in</p>
                      <p className="text-sm font-medium text-gray-900">{ticket.endsIn}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No active tickets. Buy a raffle ticket to get started!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recently Added Items</h2>
            <Link
              href="/items"
              className="text-red-600 text-sm font-medium hover:text-red-700 flex items-center gap-1"
            >
              Browse All <ArrowRight size={16} />
            </Link>
          </div>
          {rafflesLoading ? (
            <AvailableItemsSkeleton />
          ) : (
            <div className="space-y-4">
              {availableItems.length > 0 ? (
                availableItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      {item.image.startsWith('http') ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                      ) : (
                        item.image
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-red-600">₦{item.price.toLocaleString()}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{item.progress}% sold</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No active raffles right now.</div>
              )}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <Link
              href="/dashboard/wallet"
              className="text-red-600 text-sm font-medium hover:text-red-700 flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {txLoading ? (
            <RecentTransactionsSkeleton />
          ) : (
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTxIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.rawType === 'TASK_REWARD' ? (
                          <>{tx.amount >= 0 ? '+' : ''}{Math.abs(tx.amount).toLocaleString()} <span className="text-xs">⭐ pts</span></>
                        ) : (
                          <>{tx.amount >= 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}</>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No recent transactions.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex items-center gap-2">
          <Star size={18} className="text-yellow-300" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
