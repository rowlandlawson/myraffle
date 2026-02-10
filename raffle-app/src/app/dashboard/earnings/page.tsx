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

export default function EarningsPage() {
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>(
    {},
  );
  const [showWatchAd, setShowWatchAd] = useState(false);
  const [adTimer, setAdTimer] = useState(0);

  const userStats = {
    totalPoints: 2500,
    pointsThisWeek: 850,
    tasksCompleted: 12,
    referrals: 3,
  };

  const allTasks = [
    {
      id: 1,
      type: 'watch_ad',
      title: 'Watch Video Ad',
      description: 'Watch a 30-second advertisement',
      points: 10,
      time: '30 seconds',
      icon: 'https://img.icons8.com/3d-fluency/94/tv.png',
    },
    {
      id: 2,
      type: 'watch_ad',
      title: 'Watch Sports Highlights',
      description: 'Watch a 60-second sports video',
      points: 20,
      time: '60 seconds',
      icon: 'https://img.icons8.com/3d-fluency/94/trophy.png',
    },
    {
      id: 3,
      type: 'watch_ad',
      title: 'Product Review Video',
      description: 'Watch a product review (90 seconds)',
      points: 30,
      time: '90 seconds',
      icon: 'https://img.icons8.com/3d-fluency/94/star.png',
    },
    {
      id: 4,
      type: 'social_share',
      title: 'Share on WhatsApp',
      description: 'Share RaffleHub with your friends on WhatsApp',
      points: 50,
      time: '2 minutes',
      icon: 'https://img.icons8.com/3d-fluency/94/whatsapp.png',
      limit: '5 per day',
    },
    {
      id: 5,
      type: 'social_share',
      title: 'Post on Facebook',
      description: 'Share a post about RaffleHub on Facebook',
      points: 50,
      time: '2 minutes',
      icon: 'https://img.icons8.com/3d-fluency/94/facebook-new.png',
      limit: '3 per day',
    },
    {
      id: 6,
      type: 'survey',
      title: 'Quick Survey',
      description: 'Complete a 2-minute survey about your preferences',
      points: 100,
      time: '2 minutes',
      icon: 'https://img.icons8.com/3d-fluency/94/clipboard.png',
    },
    {
      id: 7,
      type: 'daily_login',
      title: 'Daily Login',
      description: 'Login to RaffleHub every day',
      points: 25,
      time: 'Daily',
      icon: 'https://img.icons8.com/3d-fluency/94/fire-element.png',
    },
    {
      id: 8,
      type: 'watch_ad',
      title: 'Music Video',
      description: 'Watch a 45-second music video',
      points: 15,
      time: '45 seconds',
      icon: 'https://img.icons8.com/3d-fluency/94/music.png',
    },
    {
      id: 9,
      type: 'social_share',
      title: 'Share on Twitter',
      description: 'Tweet about RaffleHub with #RaffleHubNG',
      points: 50,
      time: '2 minutes',
      icon: 'https://img.icons8.com/3d-fluency/94/twitterx.png',
      limit: '2 per day',
    },
  ];

  const handleCompleteTask = (taskId: number) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (task?.type === 'watch_ad') {
      setShowWatchAd(true);
      setAdTimer(31);
      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));
            setShowWatchAd(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'watch_ad':
        return 'from-blue-500 to-blue-600';
      case 'social_share':
        return 'from-green-500 to-green-600';
      case 'survey':
        return 'from-purple-500 to-purple-600';
      case 'daily_login':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

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
            title="This Week"
            value={userStats.pointsThisWeek.toLocaleString()}
            subtitle="Earned"
            icon={<Award size={20} className="text-green-500" />}
            borderColor="border-green-500"
          />
          <EarningsStatCard
            title="Tasks Done"
            value={userStats.tasksCompleted}
            subtitle="Completed this month"
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Play size={24} className="text-blue-500" /> Watch Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTasks
                .filter((t) => t.type === 'watch_ad')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={!!completedTasks[task.id]}
                    colorClass={getTaskColor(task.type)}
                    onComplete={() => handleCompleteTask(task.id)}
                    buttonLabel="Watch Now"
                  />
                ))}
            </div>
          </div>

          {/* Social Share */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 size={24} className="text-green-500" /> Share & Earn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTasks
                .filter((t) => t.type === 'social_share')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={!!completedTasks[task.id]}
                    colorClass={getTaskColor(task.type)}
                    onComplete={() => handleCompleteTask(task.id)}
                    buttonLabel="Share Now"
                  />
                ))}
            </div>
          </div>

          {/* Referral */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={24} className="text-purple-500" /> Invite & Earn
            </h2>
            <ReferralSection />
          </div>

          {/* Other Tasks */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={24} className="text-orange-500" /> Other Tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allTasks
                .filter((t) => ['survey', 'daily_login'].includes(t.type))
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={!!completedTasks[task.id]}
                    colorClass={getTaskColor(task.type)}
                    onComplete={() => handleCompleteTask(task.id)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      <WatchAdModal isOpen={showWatchAd} adTimer={adTimer} />
    </div>
  );
}
