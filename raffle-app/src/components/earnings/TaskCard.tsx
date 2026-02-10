import Image from 'next/image';
import { CheckCircle, Zap } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: number;
    type: string;
    title: string;
    description: string;
    points: number;
    time: string;
    icon: string;
    limit?: string;
  };
  isCompleted: boolean;
  colorClass: string;
  onComplete: () => void;
  buttonLabel?: string;
}

export default function TaskCard({
  task,
  isCompleted,
  colorClass,
  onComplete,
  buttonLabel = 'Complete',
}: TaskCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${colorClass} text-white rounded-xl shadow-lg p-5 md:p-6 hover:shadow-xl transition`}
    >
      <div className="flex items-start justify-between mb-4">
        <Image
          src={task.icon}
          alt={task.title}
          width={48}
          height={48}
          className="rounded-lg"
        />
        {isCompleted && <CheckCircle size={24} className="text-white" />}
      </div>
      <h3 className="font-bold text-lg mb-1">{task.title}</h3>
      <p className="text-white/80 text-sm mb-3">{task.description}</p>
      <div className="space-y-2 mb-4 pb-4 border-b border-white/30">
        <p className="flex items-center gap-2">
          <Zap size={16} />{' '}
          <span className="font-bold text-xl">{task.points} points</span>
        </p>
        {task.limit && <p className="text-xs text-white/70">{task.limit}</p>}
        <p className="text-xs text-white/70">{task.time}</p>
      </div>
      <button
        onClick={onComplete}
        disabled={isCompleted}
        className={`w-full py-2 rounded-lg font-bold transition ${
          isCompleted
            ? 'bg-white/20 text-white cursor-not-allowed'
            : 'bg-white text-gray-900 hover:bg-white/90'
        }`}
      >
        {isCompleted ? '✓ Done' : buttonLabel}
      </button>
    </div>
  );
}
