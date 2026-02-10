'use client';

import { useState } from 'react';
import { Trophy, Flame, Calendar } from 'lucide-react';

export default function WinnersPage() {
  const [timeFilter, setTimeFilter] = useState('all');

  const allWinners = [
    {
      id: 1,
      userNumber: 'USER-98765',
      userName: 'John D.',
      prize: 'iPhone 15 Pro Max',
      prizeImage: '📱',
      wonDate: '2026-01-25',
      winTime: '2 hours ago',
      ranking: 1,
      totalWinnings: 850000,
    },
    {
      id: 2,
      userNumber: 'USER-54321',
      userName: 'Sarah M.',
      prize: 'MacBook Pro 14"',
      prizeImage: '💻',
      wonDate: '2026-01-25',
      winTime: '5 hours ago',
      ranking: 2,
      totalWinnings: 580000,
    },
    {
      id: 3,
      userNumber: 'USER-11223',
      userName: 'Alex K.',
      prize: 'AirPods Pro Max',
      prizeImage: '🎧',
      wonDate: '2026-01-24',
      winTime: '1 day ago',
      ranking: 3,
      totalWinnings: 420000,
    },
    {
      id: 4,
      userNumber: 'USER-44556',
      userName: 'Maria L.',
      prize: 'PlayStation 5',
      prizeImage: '🎮',
      wonDate: '2026-01-23',
      winTime: '2 days ago',
      ranking: 4,
      totalWinnings: 350000,
    },
    {
      id: 5,
      userNumber: 'USER-77889',
      userName: 'Chris T.',
      prize: 'iPad Pro 12.9"',
      prizeImage: '📲',
      wonDate: '2026-01-23',
      winTime: '2 days ago',
      ranking: 5,
      totalWinnings: 280000,
    },
    {
      id: 6,
      userNumber: 'USER-99001',
      userName: 'Emma R.',
      prize: 'Apple Watch Ultra',
      prizeImage: '⌚',
      wonDate: '2026-01-22',
      winTime: '3 days ago',
      ranking: 6,
      totalWinnings: 250000,
    },
    {
      id: 7,
      userNumber: 'USER-22334',
      userName: 'David H.',
      prize: 'Xbox Series X',
      prizeImage: '🕹️',
      wonDate: '2026-01-22',
      winTime: '3 days ago',
      ranking: 7,
      totalWinnings: 220000,
    },
    {
      id: 8,
      userNumber: 'USER-55667',
      userName: 'Lisa P.',
      prize: 'DJI Mini 3 Pro',
      prizeImage: '🚁',
      wonDate: '2026-01-21',
      winTime: '4 days ago',
      ranking: 8,
      totalWinnings: 180000,
    },
    {
      id: 9,
      userNumber: 'USER-88990',
      userName: 'James N.',
      prize: 'Nintendo Switch OLED',
      prizeImage: '🎯',
      wonDate: '2026-01-21',
      winTime: '4 days ago',
      ranking: 9,
      totalWinnings: 150000,
    },
    {
      id: 10,
      userNumber: 'USER-33445',
      userName: 'Rachel C.',
      prize: 'Samsung Galaxy Buds Pro',
      prizeImage: '🎵',
      wonDate: '2026-01-20',
      winTime: '5 days ago',
      ranking: 10,
      totalWinnings: 120000,
    },
  ];

  const topWinners = allWinners.slice(0, 3);
  const otherWinners = allWinners.slice(3);

  const getMedalEmoji = (ranking: number) => {
    switch (ranking) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${ranking}`;
    }
  };

  const getMedalColor = (ranking: number) => {
    switch (ranking) {
      case 1:
        return 'from-yellow-400 to-yellow-500 text-yellow-900';
      case 2:
        return 'from-gray-300 to-gray-400 text-gray-900';
      case 3:
        return 'from-orange-400 to-orange-500 text-orange-900';
      default:
        return 'from-blue-100 to-blue-200 text-blue-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Trophy size={32} /> Recent Winners
          </h1>
          <p className="text-white/90">
            Celebrate our lucky winners from the last 30 days
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 font-semibold mb-2">
              Total Winners (This Month)
            </p>
            <p className="text-4xl font-bold text-gray-900">248</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 font-semibold mb-2">
              Total Distributed
            </p>
            <p className="text-4xl font-bold text-red-600">₦3.2M</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 font-semibold mb-2">Average Win</p>
            <p className="text-4xl font-bold text-green-600">₦12.9k</p>
          </div>
        </div>

        {/* Top 3 Winners */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏆 Top Winners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topWinners.map((winner) => (
              <div
                key={winner.id}
                className={`bg-gradient-to-br ${getMedalColor(winner.ranking)} rounded-2xl shadow-xl p-8 text-center relative overflow-hidden`}
              >
                {/* Medal */}
                <div className="absolute top-4 right-4 text-4xl">
                  {getMedalEmoji(winner.ranking)}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <p className="text-4xl font-bold mb-2">
                    {getMedalEmoji(winner.ranking)}
                  </p>
                  <div className="text-6xl mb-4">{winner.prizeImage}</div>
                  <h3 className="text-xl font-bold mb-1">{winner.prize}</h3>
                  <p className="font-semibold mb-3 text-sm opacity-90">
                    {winner.userName}
                  </p>
                  <p className="text-xs opacity-75 mb-4">{winner.userNumber}</p>
                  <div className="border-t border-current/30 pt-4 mt-4">
                    <p className="text-sm opacity-90">Total Winnings</p>
                    <p className="text-2xl font-bold">
                      ₦{(winner.totalWinnings / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Winners List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Recent Winners
          </h2>

          <div className="space-y-4">
            {otherWinners.map((winner) => (
              <div
                key={winner.id}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition flex items-center gap-6 border-l-4 border-blue-500"
              >
                {/* Ranking */}
                <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    #{winner.ranking}
                  </span>
                </div>

                {/* Prize Image */}
                <div className="flex-shrink-0 text-5xl">
                  {winner.prizeImage}
                </div>

                {/* Winner Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">
                    {winner.prize}
                  </h3>
                  <p className="text-gray-600">
                    {winner.userName} ({winner.userNumber})
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={14} /> {winner.wonDate}
                  </p>
                </div>

                {/* Time and Winnings */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm text-gray-500">{winner.winTime}</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₦{(winner.totalWinnings / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-gray-500">Total winnings</p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-gray-400">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ❓ Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                How are winners selected?
              </h3>
              <p className="text-gray-600">
                Winners are selected using a provably fair random algorithm.
                Each ticket has an equal chance of winning, regardless of when
                it was purchased.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                When are winners announced?
              </h3>
              <p className="text-gray-600">
                Winners are announced within 1 hour of raffle completion.
                You&apos;ll receive an SMS and email notification immediately if
                you&apos;ve won.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                How do I claim my prize?
              </h3>
              <p className="text-gray-600">
                Winners are contacted directly by our team. Prizes are shipped
                to your registered address within 5-7 business days.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Can I verify a winner?
              </h3>
              <p className="text-gray-600">
                Yes! All winners on this page are verified and have claimed
                their prizes. You can check the verification details in the
                raffle history.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                What&apos;s the largest prize won?
              </h3>
              <p className="text-gray-600">
                The largest prize won so far was an iPhone 15 Pro Max valued at
                ₦850,000. But many more high-value items are being raffled every
                week!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                What are my chances of winning?
              </h3>
              <p className="text-gray-600">
                Your chances depend on how many tickets are sold. For example,
                if 100 tickets are sold, you have a 1/100 (1%) chance with one
                ticket. More tickets = better odds!
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Win?</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            You could be next! Browse our available items and buy your raffle
            ticket today. The odds are in your favor!
          </p>
          <a
            href="/items"
            className="inline-block px-8 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
          >
            Browse Items
          </a>
        </div>
      </div>
    </div>
  );
}
