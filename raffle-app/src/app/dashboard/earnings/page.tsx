'use client';

import EarningsStatCard from '@/components/earnings/EarningsStatCard';
import ReferralSection from '@/components/earnings/ReferralSection';
import TaskCard from '@/components/earnings/TaskCard';
import WatchAdModal from '@/components/earnings/WatchAdModal';
import WalletTransactionRow from '@/components/wallet/WalletTransactionRow';
import { useAuthStore } from '@/lib/authStore';
import { type TaskItem, useCompleteTask, useCompletedTasks, useTasks } from '@/lib/hooks/useTasks';
import type { StatsRange } from '@/lib/hooks/useTasks';
import { useWalletTransactions } from '@/lib/hooks/useWallet';
import { Award, Calendar, CheckCircle, Lightbulb, Play, Share2, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function EarningsPage() {
  const { user } = useAuthStore();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const [statsRange, setStatsRange] = useState<StatsRange>('today');
  const { data: completedData, isLoading: completedLoading } = useCompletedTasks(statsRange);
  const { data: txData } = useWalletTransactions();
  const completeTaskMutation = useCompleteTask();

  const [showWatchAd, setShowWatchAd] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [adTotalDuration, setAdTotalDuration] = useState(30);
  const [_completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'earnings'>('tasks');
  const [clickedTaskIds, setClickedTaskIds] = useState<Set<string>>(new Set());

  const completedTaskIds = new Set((completedData?.completedTasks ?? []).map((ct) => ct.taskId));

  // NOTE: DAILY_LOGIN auto-complete is handled by the dashboard page, not here.

  const userStats = {
    totalPoints: user?.walletBalance ?? 1000,
    totalPointsEarned: completedData?.summary.totalPointsEarned ?? 0,
    tasksCompleted: completedData?.summary.totalTasksCompleted ?? 0,
    referrals: (completedData?.completedTasks ?? []).filter((ct) => ct.task.type === 'REFERRAL')
      .length,
  };

  const handleCompleteTask = async (task: TaskItem) => {
    if (task.type.startsWith('WATCH_AD')) {
      const duration = task.adDuration || 30;
      // Simulate watching an ad before completing
      setCompletingTaskId(task.id);
      setShowWatchAd(true);
      setAdTimer(duration);
      setAdTotalDuration(duration);
      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowWatchAd(false);
            // Now actually complete the task via API
            completeTaskMutation.mutate(task.id, {
              onError: (err: Error) => toast.error(err.message || 'Failed to complete task'),
            });
            setCompletingTaskId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCompletingTaskId(task.id);
      completeTaskMutation.mutate(task.id, {
        onSuccess: () => setCompletingTaskId(null),
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to complete task');
          setCompletingTaskId(null);
        },
      });
    }
  };
  const handleTaskAction = (task: TaskItem) => {
    if (task.type.startsWith('SOCIAL_')) {
      handleCompleteTask(task);
      return;
    }

    if (task.actionUrl && !clickedTaskIds.has(task.id)) {
      window.open(task.actionUrl, '_blank');
      setClickedTaskIds((prev) => new Set(prev).add(task.id));
      return;
    }
    handleCompleteTask(task);
  };

  const getButtonLabel = (task: TaskItem) => {
    // Social tasks: show completed state
    if (
      task.type.startsWith('SOCIAL_') &&
      (task.recentlyCompleted || completedTaskIds.has(task.id as string))
    ) {
      return 'Completed ✓';
    }
    // Daily login: show claimed state
    if (task.type === 'DAILY_LOGIN' && task.completedToday) {
      return 'Claimed ✓';
    }
    // Watch ad tasks: show completed state
    if (task.type.startsWith('WATCH_AD') && completedTaskIds.has(task.id as string)) {
      return 'Completed ✓';
    }
    if (task.actionUrl && clickedTaskIds.has(task.id)) return "I've Done This";
    switch (task.type) {
      case 'WATCH_AD_VIDEO':
        return 'Watch Video';
      case 'WATCH_AD_PICTURE':
        return 'View Picture';
      case 'WATCH_AD_BANNER':
        return 'View Banner';
      case 'SOCIAL_SHARE':
      case 'SOCIAL_LIKE':
      case 'SOCIAL_COMMENT':
      case 'SOCIAL_FOLLOW':
        return 'Share Now';
      case 'DAILY_LOGIN':
        return 'Claim';
      case 'SURVEY':
        return 'Start Survey';
      default:
        return task.actionUrl ? 'Go To Link' : 'Complete';
    }
  };

  // Group tasks by type for display
  const watchAdTasks = tasks.filter((t) => t.type.startsWith('WATCH_AD'));
  const socialTasks = tasks.filter((t) => t.type.startsWith('SOCIAL_'));

  // Deduplicate DAILY_LOGIN — only show one card
  const seenDailyLogin = { seen: false };
  const otherTasks = tasks.filter((t) => {
    if (t.type === 'DAILY_LOGIN') {
      if (seenDailyLogin.seen) return false;
      seenDailyLogin.seen = true;
      return true;
    }
    return t.type === 'SURVEY';
  });

  // Count today's completions per task for daily limit tracking
  const getCompletionsToday = (taskId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (completedData?.completedTasks ?? []).filter(
      (ct) => ct.taskId === taskId && new Date(ct.completedAt) >= today,
    ).length;
  };

  if (tasksLoading || completedLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl mb-6 md:mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Earn Naira Rewards</h1>
          <p className="text-red-100 text-sm md:text-base">
            Complete tasks and watch ads to earn free Naira added directly to your wallet
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Tabs Header */}
        <div className="flex space-x-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 px-1 font-semibold text-base transition-colors border-b-2 ${activeTab === 'tasks' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`pb-3 px-1 font-semibold text-base transition-colors border-b-2 ${activeTab === 'earnings' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            My Earnings
          </button>
        </div>

        {activeTab === 'earnings' ? (
          <div className="space-y-8">
            {/* Time Range Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar size={16} className="text-gray-400" />
              {(
                [
                  ['today', 'Today'],
                  ['week', 'This Week'],
                  ['month', 'This Month'],
                  ['year', 'This Year'],
                  ['all', 'All Time'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatsRange(value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    statsRange === value
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <EarningsStatCard
                title="Wallet Balance"
                value={`₦${userStats.totalPoints.toLocaleString()}`}
                subtitle="Available"
                icon={<Zap size={20} className="text-green-500" />}
                borderColor="border-green-500"
              />
              <EarningsStatCard
                title="Earned"
                value={`₦${userStats.totalPointsEarned.toLocaleString()}`}
                subtitle={
                  statsRange === 'all'
                    ? 'All time'
                    : statsRange === 'today'
                      ? 'Today'
                      : statsRange === 'week'
                        ? 'This week'
                        : statsRange === 'month'
                          ? 'This month'
                          : 'This year'
                }
                icon={<Award size={20} className="text-green-500" />}
                borderColor="border-green-500"
              />
              <EarningsStatCard
                title="Tasks Done"
                value={userStats.tasksCompleted}
                subtitle={
                  statsRange === 'all'
                    ? 'All time'
                    : statsRange === 'today'
                      ? 'Today'
                      : statsRange === 'week'
                        ? 'This week'
                        : statsRange === 'month'
                          ? 'This month'
                          : 'This year'
                }
                icon={<CheckCircle size={24} className="text-blue-500" />}
                borderColor="border-blue-500"
              />
              <EarningsStatCard
                title="Referrals"
                value={userStats.referrals}
                subtitle={
                  statsRange === 'all'
                    ? 'All time'
                    : statsRange === 'today'
                      ? 'Today'
                      : statsRange === 'week'
                        ? 'This week'
                        : statsRange === 'month'
                          ? 'This month'
                          : 'This year'
                }
                icon={<Users size={24} className="text-purple-500" />}
                borderColor="border-purple-500"
              />
            </div>

            {/* Conversion Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
              <p className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-500" /> How It Works
              </p>
              <p className="text-blue-800 text-sm">
                Earn Naira rewards directly into your wallet by watching ads, completing tasks, and
                referring friends. Use your wallet balance to enter any raffle draw!
              </p>
            </div>

            {/* Wallet Transactions History */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Wallet Transactions</h3>
              {txData?.transactions && txData.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                          Ref
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {txData.transactions.map((tx) => {
                        const date = new Date(tx.createdAt);
                        const isMinus = tx.type === 'WITHDRAWAL' || tx.type === 'TICKET_PURCHASE';
                        const mapType = (
                          t: string,
                        ): 'deposit' | 'withdrawal' | 'reward' | 'purchase' => {
                          if (t === 'TICKET_PURCHASE') return 'purchase';
                          if (t === 'TASK_REWARD' || t === 'RAFFLE_WIN') return 'reward';
                          if (t === 'WITHDRAWAL') return 'withdrawal';
                          return 'deposit';
                        };
                        return (
                          <WalletTransactionRow
                            key={tx.id}
                            transaction={{
                              id: tx.id,
                              type: mapType(tx.type),
                              rawType: tx.type,
                              description: tx.description || `${tx.type} transaction`,
                              amount: isMinus ? -tx.amount : tx.amount,
                              date: date.toISOString().split('T')[0],
                              time: date.toTimeString().slice(0, 5),
                              status: tx.status === 'COMPLETED' ? 'completed' : 'pending',
                              reference: tx.reference || `TXN-${tx.id.slice(0, 8)}`,
                            }}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-700 font-bold text-sm">No transactions recorded yet</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Your wallet activity will show up here
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Watch Ads */}
            {watchAdTasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Play size={24} className="text-blue-500" /> Watch & Earn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {watchAdTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{
                        id: task.id,
                        type: task.type.toLowerCase(),
                        title: task.title,
                        description: task.description,
                        points: task.points,
                        time: task.adDuration ? `${task.adDuration}s` : '30s',
                        actionUrl: task.actionUrl,
                        platform: task.platform,
                      }}
                      isCompleted={completedTaskIds.has(task.id) || !!task.completedToday}
                      isClickedUrl={clickedTaskIds.has(task.id)}
                      onComplete={() => handleTaskAction(task)}
                      buttonLabel={getButtonLabel(task)}
                      completionsToday={getCompletionsToday(task.id)}
                      dailyLimit={task.dailyLimit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            {socialTasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 size={24} className="text-green-500" /> Share & Earn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {socialTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{
                        id: task.id,
                        type: task.type.toLowerCase(),
                        title: task.title,
                        description: task.description,
                        points: task.points,
                        time: '1 min',
                        actionUrl: task.actionUrl,
                        platform: task.platform,
                      }}
                      isCompleted={completedTaskIds.has(task.id) || !!task.recentlyCompleted}
                      isClickedUrl={clickedTaskIds.has(task.id)}
                      onComplete={() => handleTaskAction(task)}
                      buttonLabel={getButtonLabel(task)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Referral */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={24} className="text-purple-500" /> Invite & Earn
              </h2>
              <ReferralSection />
            </div>

            {/* Other Tasks */}
            {otherTasks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={24} className="text-orange-500" /> Other Tasks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{
                        id: task.id,
                        type: task.type.toLowerCase(),
                        title: task.title,
                        description: task.description,
                        points: task.points,
                        time: task.type === 'DAILY_LOGIN' ? 'Daily' : '2 mins',
                        actionUrl: task.actionUrl,
                        platform: task.platform,
                      }}
                      isCompleted={
                        task.type === 'DAILY_LOGIN'
                          ? !!task.completedToday
                          : !!task.recentlyCompleted
                      }
                      isClickedUrl={clickedTaskIds.has(task.id)}
                      onComplete={() => handleTaskAction(task)}
                      buttonLabel={getButtonLabel(task)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state if no tasks */}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No tasks available right now. Check back later!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <WatchAdModal isOpen={showWatchAd} adTimer={adTimer} totalDuration={adTotalDuration} />
    </div>
  );
}
