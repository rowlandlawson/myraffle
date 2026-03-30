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
    // Duplicate for seamless infinite scroll
    const scrollWinners = [...winners, ...winners];

    return (
        <section id="winners" className="py-10 px-4 bg-white overflow-hidden">
            {/* Keyframe animation injected via a plain <style> tag — no styled-jsx */}
            <style>{`
        @keyframes winners-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .winners-ticker {
          animation: winners-scroll 20s linear infinite;
        }
        .winners-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <Trophy size={16} className="text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                        Recent Winners
                    </h2>
                </div>

                {/* Horizontal scrolling ticker */}
                <div className="relative">
                    <div className="flex gap-4 winners-ticker">
                        {scrollWinners.map((winner, i) => (
                            <div
                                key={`${winner.id}-${i}`}
                                className="flex-none w-64 sm:w-72 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-bold">
                                            {winner.userNumber.slice(-2)}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-gray-900 truncate">
                                            {winner.userNumber}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            Won <span className="font-semibold text-gray-700">{winner.itemName}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">{winner.date}</div>
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
