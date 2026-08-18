'use client';

import { Trophy } from 'lucide-react';

interface Winner {
  id: number;
  userNumber: string;
  itemName: string;
  date: string;
}

interface WinnersSectionProps {
  winners: Winner[];
}

export default function WinnersSection({ winners }: WinnersSectionProps) {
  const scrollWinners = [...winners, ...winners];

  // Generate a consistent initial from userNumber
  const getInitial = (str: string) => str?.charAt(0)?.toUpperCase() || '?';

  // A small set of avatar bg colors for variety
  const avatarColors = [
    'bg-[#E10600]',
    'bg-purple-600',
    'bg-blue-600',
    'bg-emerald-600',
    'bg-orange-500',
  ];

  return (
    <section id="winners" className="py-12 px-4 bg-white overflow-hidden">
      <style>{`
        @keyframes winners-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .winners-ticker {
          animation: winners-scroll 25s linear infinite;
        }
        .winners-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-sm">
            <Trophy size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Winners</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Real people, real prizes — verified draws
            </p>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex gap-3 winners-ticker">
            {scrollWinners.map((winner, i) => (
              <div
                key={`${winner.id}-${i}`}
                className="flex-none w-60 bg-white border border-gray-100 rounded-2xl p-3.5 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <span className="text-white text-sm font-bold">
                      {getInitial(winner.userNumber)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {winner.userNumber}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      Won <span className="font-semibold text-gray-700">{winner.itemName}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{winner.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
