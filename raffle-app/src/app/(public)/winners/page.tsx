'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface WinnerData {
  raffle: {
    id: string;
    raffleDate: string;
    ticketsSold: number;
  };
  item: {
    id: string;
    name: string;
    imageUrl: string;
    value: number;
  };
  winner: {
    id: string;
    name: string;
    userNumber: string;
  };
  winningTicketNumber: string | null;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinners() {
      setLoading(true);
      try {
        // Get completed raffles
        const res = await api.get('/api/raffles?status=COMPLETED&limit=50');
        const resData = res.data as any;
        const completedRaffles = resData.raffles;

        // For each completed raffle, get winner details
        const winnerPromises = completedRaffles.map(async (raffle: any) => {
          try {
            const winnerRes = await api.get(`/api/raffles/${raffle.id}/winners`);
            return winnerRes.data;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(winnerPromises);
        setWinners(results.filter(Boolean));
      } catch (err) {
        console.error('Failed to load winners:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWinners();
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getImageSrc = (imageUrl: string) => {
    if (imageUrl?.startsWith('/uploads')) return `${apiUrl}${imageUrl}`;
    return imageUrl || '📦';
  };

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

  const topWinners = winners.slice(0, 3);
  const otherWinners = winners.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Trophy size={32} /> Recent Winners
          </h1>
          <p className="text-white/90">
            Celebrate our lucky winners
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 font-semibold mb-2">
              Total Winners
            </p>
            <p className="text-4xl font-bold text-gray-900">{winners.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 font-semibold mb-2">
              Total Value Distributed
            </p>
            <p className="text-4xl font-bold text-red-600">
              ₦{winners.reduce((sum, w) => sum + (w.item?.value || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 font-semibold mb-2">Average Win</p>
            <p className="text-4xl font-bold text-green-600">
              ₦{winners.length > 0
                ? Math.round(winners.reduce((sum, w) => sum + (w.item?.value || 0), 0) / winners.length).toLocaleString()
                : '0'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading winners...</p>
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-600 text-lg">No winners yet — be the first!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Winners */}
            {topWinners.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🏆 Top Winners
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topWinners.map((w, index) => (
                    <div
                      key={w.raffle.id}
                      className={`bg-gradient-to-br ${getMedalColor(index + 1)} rounded-2xl shadow-xl p-8 text-center relative overflow-hidden`}
                    >
                      <div className="absolute top-4 right-4 text-4xl">
                        {getMedalEmoji(index + 1)}
                      </div>
                      <div className="relative z-10">
                        <p className="text-4xl font-bold mb-2">
                          {getMedalEmoji(index + 1)}
                        </p>
                        <div className="text-6xl mb-4">
                          {getImageSrc(w.item.imageUrl).startsWith('http') ? (
                            <img
                              src={getImageSrc(w.item.imageUrl)}
                              alt={w.item.name}
                              className="w-20 h-20 object-cover rounded-xl mx-auto"
                            />
                          ) : (
                            getImageSrc(w.item.imageUrl)
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-1">{w.item.name}</h3>
                        <p className="font-semibold mb-3 text-sm opacity-90">
                          {w.winner.name}
                        </p>
                        <p className="text-xs opacity-75 mb-4">{w.winner.userNumber}</p>
                        <div className="border-t border-current/30 pt-4 mt-4">
                          <p className="text-sm opacity-90">Prize Value</p>
                          <p className="text-2xl font-bold">
                            ₦{w.item.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Winners List */}
            {otherWinners.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  All Recent Winners
                </h2>
                <div className="space-y-4">
                  {otherWinners.map((w, index) => (
                    <div
                      key={w.raffle.id}
                      className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition flex items-center gap-6 border-l-4 border-blue-500"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          #{index + 4}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {getImageSrc(w.item.imageUrl).startsWith('http') ? (
                          <img
                            src={getImageSrc(w.item.imageUrl)}
                            alt={w.item.name}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-5xl">{getImageSrc(w.item.imageUrl)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900">
                          {w.item.name}
                        </h3>
                        <p className="text-gray-600">
                          {w.winner.name} ({w.winner.userNumber})
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {new Date(w.raffle.raffleDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ₦{w.item.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Prize value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">How are winners selected?</h3>
              <p className="text-gray-600">
                Winners are selected using a provably fair random algorithm.
                Each ticket has an equal chance of winning, regardless of when it was purchased.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">When are winners announced?</h3>
              <p className="text-gray-600">
                Winners are announced within 1 hour of raffle completion.
                You&apos;ll receive an SMS and email notification immediately if you&apos;ve won.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">How do I claim my prize?</h3>
              <p className="text-gray-600">
                Winners are contacted directly by our team. Prizes are shipped
                to your registered address within 5-7 business days.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What are my chances of winning?</h3>
              <p className="text-gray-600">
                Your chances depend on how many tickets are sold. For example,
                if 100 tickets are sold, you have a 1/100 (1%) chance with one
                ticket.
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
