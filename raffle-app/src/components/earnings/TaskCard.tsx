import { CheckCircle, Clock, Play, Share2, Award, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TaskCardProps {
  task: {
    id: string | number;
    type: string;
    title: string;
    description: string;
    points: number;
    time: string;
    limit?: string;
    actionUrl?: string | null;
    platform?: string | null;
  };
  isCompleted: boolean;
  onComplete: () => void;
  buttonLabel?: string;
  isClickedUrl?: boolean;
  completionsToday?: number;
  dailyLimit?: number | null;
}

export default function TaskCard({
  task,
  isCompleted,
  onComplete,
  buttonLabel = 'Complete',
  isClickedUrl = false,
  completionsToday = 0,
  dailyLimit = null,
}: TaskCardProps) {
  const isSocialTask = task.type.startsWith('social');
  const isAdTask = task.type.startsWith('watch_ad');
  const limitReached = dailyLimit != null && dailyLimit > 0 && completionsToday >= dailyLimit;
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyTimer, setVerifyTimer] = useState(15);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVerifying && verifyTimer > 0) {
      interval = setInterval(() => setVerifyTimer((prev) => prev - 1), 1000);
    } else if (isVerifying && verifyTimer === 0) {
      setIsVerifying(false);
      setCanClaim(true);
    }
    return () => clearInterval(interval);
  }, [isVerifying, verifyTimer]);

  const handleButtonClick = () => {
    if (isCompleted) return;

    if (isSocialTask) {
      if (!isVerifying && !canClaim) {
        if (task.actionUrl) window.open(task.actionUrl, '_blank');
        setIsVerifying(true);
      } else if (canClaim) {
        onComplete();
      }
    } else {
      onComplete();
    }
  };
  const getTypeIcon = () => {
    switch (task.type) {
      case 'watch_ad_video': return <Play size={14} />;
      case 'watch_ad_picture': return <Play size={14} />;
      case 'watch_ad_banner': return <Play size={14} />;
      case 'social_share':
      case 'social_like':
      case 'social_comment':
      case 'social_follow':
        return <Share2 size={14} />;
      default: return <Award size={14} />;
    }
  };

  const getTypeLabel = () => {
    switch (task.type) {
      case 'watch_ad_video': return 'Video';
      case 'watch_ad_picture': return 'Picture';
      case 'watch_ad_banner': return 'Banner';
      case 'social_share':
      case 'social_like':
      case 'social_comment':
      case 'social_follow':
        return 'Social';
      case 'daily_login': return 'Daily';
      case 'survey': return 'Survey';
      default: return 'Task';
    }
  };

  const getBadgeColors = () => {
    switch (task.type) {
      case 'watch_ad_video': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'watch_ad_picture': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      case 'watch_ad_banner': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'social_share':
      case 'social_like':
      case 'social_comment':
      case 'social_follow':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'daily_login': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'survey': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition flex flex-col h-full relative overflow-hidden">
      {/* Subtle top border accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 opacity-50 ${getBadgeColors().split(' ')[1].replace('text-', 'bg-')}`} />

      <div className="flex items-start justify-between mb-3 mt-1">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getBadgeColors()}`}>
          {getTypeIcon()}
          <span>{getTypeLabel()}</span>
        </div>
        {isCompleted && <CheckCircle size={20} className="text-green-500" />}
      </div>

      <h3 className="font-bold text-gray-900 text-lg mb-1">{task.title}</h3>
      <p className="text-gray-500 text-sm mb-5 flex-grow">{task.description}</p>

      <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex flex-col flex-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Reward</span>
          <span className="font-bold text-red-600 text-base">{task.points} pts</span>
        </div>

        <div className="w-px h-8 bg-gray-200"></div>

        <div className="flex flex-col flex-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Time</span>
          <div className="flex items-center gap-1 text-gray-700 text-sm font-semibold">
            <Clock size={12} className="text-gray-400" />
            {task.time}
          </div>
        </div>

        {task.platform && (
          <>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Platform</span>
              <span className="text-gray-700 text-sm font-semibold capitalize truncate">{task.platform}</span>
            </div>
          </>
        )}

        {dailyLimit != null && dailyLimit > 0 && (
          <>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Today</span>
              <span className={`text-sm font-semibold ${limitReached ? 'text-red-500' : 'text-gray-700'}`}>
                {completionsToday} / {dailyLimit}
              </span>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleButtonClick}
        disabled={isCompleted || limitReached || (isSocialTask && isVerifying)}
        className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isCompleted || limitReached ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
            isSocialTask && isVerifying ? 'bg-gray-100 text-gray-500 cursor-wait' :
              isSocialTask && canClaim ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200' :
                isClickedUrl ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200' :
                  task.actionUrl && !isClickedUrl && !isSocialTask ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' :
                    'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200'
          }`}
      >
        {isCompleted ? (
          <>
            <CheckCircle size={18} />
            Done
          </>
        ) : limitReached ? (
          'Limit reached — check back tomorrow!'
        ) : isSocialTask ? (
          isVerifying ? `Verifying... (${verifyTimer}s)` :
            canClaim ? 'Claim Points' :
              <>Go to Post <ExternalLink size={16} /></>
        ) : task.actionUrl && !isClickedUrl ? (
          <>
            {buttonLabel}
            <ExternalLink size={16} />
          </>
        ) : isClickedUrl ? (
          <>
            {buttonLabel}
            <CheckCircle size={16} />
          </>
        ) : (
          buttonLabel
        )}
      </button>
    </div>
  );
}
