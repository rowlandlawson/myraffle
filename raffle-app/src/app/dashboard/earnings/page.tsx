'use client';

import { useState } from 'react';
import {
  Play,
  Users,
  Share2,
  CheckCircle,
  Zap,
  Award,
  Lightbulb,
} from 'lucide-react';
import TaskCard from '@/components/earnings/TaskCard';
import ReferralSection from '@/components/earnings/ReferralSection';
import WatchAdModal from '@/components/earnings/WatchAdModal';
import EarningsStatCard from '@/components/earnings/EarningsStatCard';
import { useAuthStore } from '@/lib/authStore';
import { useTasks, useCompletedTasks, useCompleteTask } from '@/lib/hooks/useTasks';

// Map task type from backend to icon URL
const TASK_ICONS: Record<string, string> = {
  WATCH_AD: 'https://img.icons8.com/3d-fluency/94/tv.png',
  SOCIAL_SHARE: 'https://img.icons8.com/3d-fluency/94/whatsapp.png',
  SURVEY: 'https://img.icons8.com/3d-fluency/94/clipboard.png',
  DAILY_LOGIN: 'https://img.icons8.com/3d-fluency/94/fire-element.png',
  REFERRAL: 'https://img.icons8.com/3d-fluency/94/handshake.png',
};

export default function EarningsPage() {
  const { user } = useAuthStore();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: completedData, isLoading: completedLoading } = useCompletedTasks();
  const completeTaskMutation = useCompleteTask();

  const [showWatchAd, setShowWatchAd] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const completedTaskIds = new Set(
    (completedData?.completedTasks ?? []).map((ct) => ct.taskId),
  );

  const userStats = {
    totalPoints: user?.rafflePoints || 0,
    totalPointsEarned: completedData?.summary.totalPointsEarned ?? 0,
    tasksCompleted: completedData?.summary.totalTasksCompleted ?? 0,
    referrals: (completedData?.completedTasks ?? []).filter(
      (ct) => ct.task.type === 'REFERRAL',
    ).length,
  };

  const handleCompleteTask = async (taskId: string, taskType: string) => {
    if (taskType === 'WATCH_AD') {
      // Simulate watching an ad before completing
      setCompletingTaskId(taskId);
      setShowWatchAd(true);
      setAdTimer(31);
      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowWatchAd(false);
            // Now actually complete the task via API
            completeTaskMutation.mutate(taskId, {
              onError: (err: any) => alert(err.message || 'Failed to complete task'),
            });
            setCompletingTaskId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCompletingTaskId(taskId);
      completeTaskMutation.mutate(taskId, {
        onSuccess: () => setCompletingTaskId(null),
        onError: (err: any) => {
          alert(err.message || 'Failed to complete task');
          setCompletingTaskId(null);
        },
      });
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'WATCH_AD':
        return 'from-blue-500 to-blue-600';
      case 'SOCIAL_SHARE':
        return 'from-green-500 to-green-600';
      case 'SURVEY':
        return 'from-purple-500 to-purple-600';
      case 'DAILY_LOGIN':
        return 'from-orange-500 to-orange-600';
      case 'REFERRAL':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getButtonLabel = (type: string) => {
    switch (type) {
      case 'WATCH_AD':
        return 'Watch Now';
      case 'SOCIAL_SHARE':
        return 'Share Now';
      case 'DAILY_LOGIN':
        return 'Claim';
      case 'SURVEY':
        return 'Start Survey';
      default:
        return 'Complete';
    }
  };

  // Group tasks by type for display
  const watchAdTasks = tasks.filter((t) => t.type === 'WATCH_AD');
  const socialTasks = tasks.filter((t) => t.type === 'SOCIAL_SHARE');
  const otherTasks = tasks.filter((t) =>
    ['SURVEY', 'DAILY_LOGIN'].includes(t.type),
  );

  if (tasksLoading || completedLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></span>
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Earn Raffle Points
          </h1>
          <p className="text-red-100 text-sm md:text-base">
            Complete tasks and watch ads to earn free raffle points
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <EarningsStatCard
            title="Total Points"
            value={userStats.totalPoints.toLocaleString()}
            subtitle="Available"
            icon={<Zap size={20} className="text-yellow-400" />}
            borderColor="border-yellow-400"
          />
          <EarningsStatCard
            title="Earned"
            value={userStats.totalPointsEarned.toLocaleString()}
            subtitle="All time"
            icon={<Award size={20} className="text-green-500" />}
            borderColor="border-green-500"
          />
          <EarningsStatCard
            title="Tasks Done"
            value={userStats.tasksCompleted}
            subtitle="Completed"
            icon={<CheckCircle size={24} className="text-blue-500" />}
            borderColor="border-blue-500"
          />
          <EarningsStatCard
            title="Referrals"
            value={userStats.referrals}
            subtitle="Friends invited"
            icon={<Users size={24} className="text-purple-500" />}
            borderColor="border-purple-500"
          />
        </div>

        {/* Conversion Info */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
          <p className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-500" /> How It Works
          </p>
          <p className="text-blue-800">
            <span className="font-bold">1,000 raffle points = ₦100</span>. Earn
            points by watching ads, completing surveys, and sharing RaffleHub
            with friends. Use your points to buy raffle tickets for free!
          </p>
        </div>

        {/* Task Categories */}
        <div className="space-y-8">
          {/* Watch Ads */}
          {watchAdTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Play size={24} className="text-blue-500" /> Watch Videos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchAdTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={{
                      id: task.id as any,
                      type: task.type.toLowerCase(),
                      title: task.title,
                      description: task.description,
                      points: task.points,
                      time: '30 seconds',
                      icon: TASK_ICONS[task.type] || TASK_ICONS.WATCH_AD,
                    }}
                    isCompleted={completedTaskIds.has(task.id)}
                    colorClass={getTaskColor(task.type)}
                    onComplete={() => handleCompleteTask(task.id, task.type)}
                    buttonLabel={getButtonLabel(task.type)}
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
                      id: task.id as any,
                      type: task.type.toLowerCase(),
                      title: task.title,
                      description: task.description,
                      points: task.points,
                      time: '2 minutes',
                      icon: TASK_ICONS[task.type] || TASK_ICONS.SOCIAL_SHARE,
                    }}
                    isCompleted={completedTaskIds.has(task.id)}
                    colorClass={getTaskColor(task.type)}
                    onComplete={() => handleCompleteTask(task.id, task.type)}
                    buttonLabel={getButtonLabel(task.type)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={{
                      id: task.id as any,
                      type: task.type.toLowerCase(),
                      title: task.title,
                      description: task.description,
                      points: task.points,
                      time: task.type === 'DAILY_LOGIN' ? 'Daily' : '2 minutes',
                      icon: TASK_ICONS[task.type] || TASK_ICONS.DAILY_LOGIN,
                    }}
                    isCompleted={completedTaskIds.has(task.id)}
                    colorClass={getTaskColor(task.type)}
                    onComplete={() => handleCompleteTask(task.id, task.type)}
                    buttonLabel={getButtonLabel(task.type)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no tasks */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 text-lg">No tasks available right now. Check back later!</p>
            </div>
          )}
        </div>
      </div>

      <WatchAdModal isOpen={showWatchAd} adTimer={adTimer} />
    </div>
  );
}
