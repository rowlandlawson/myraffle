'use client';

import { useState } from 'react';
import { resolveImageUrl } from '@/lib/imageUrl';
import { ApiRaffle } from '@/lib/hooks/useRaffles';

interface WinnersCarouselProps {
  completedRaffles?: ApiRaffle[];
}

export default function WinnersCarousel({ completedRaffles = [] }: WinnersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If there are no winners in the database, return null (do not show section)
  if (!completedRaffles || completedRaffles.length === 0) {
    return null;
  }

  // Map database completed raffles
  const displayWinners = completedRaffles.map((r) => {
    const formattedDate = new Date(r.raffleDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return {
      id: r.id,
      winnerName: r.winner?.name || r.winner?.userNumber || 'Lucky Winner',
      itemName: r.item?.name || 'Raffle Prize',
      ticketNumber: r.winnerUserId ? `TK-${r.id.slice(0, 8).toUpperCase()}` : 'N/A',
      announcedDate: formattedDate,
      productImage: resolveImageUrl(r.item?.imageUrl) || '',
      winnerPhoto: resolveImageUrl(r.item?.imageUrl) || '',
    };
  });

  const currentWinner = displayWinners[currentIndex] || displayWinners[0];

  return (
    <section className="my-8 rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100">
      {/* Top Banner with Red bg-red-600 and Yellow bg-yellow-400 border */}
      <div className="bg-red-600 py-3.5 px-4 text-center border-b-4 border-yellow-400">
        <h2 className="text-white text-base sm:text-lg font-black tracking-wide uppercase">
          A SELECTION OF OUR WINNERS!
        </h2>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-6">
        {/* Two Images Side by Side */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Product Image Container */}
          <div className="relative aspect-square rounded-2xl bg-yellow-400 p-3 overflow-hidden flex items-center justify-center">
            <div className="absolute top-2 right-2 text-[9px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded">
              RAFFLE
            </div>
            {currentWinner.productImage ? (
              <img
                src={currentWinner.productImage}
                alt="Product"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-5xl">🎁</div>
            )}
          </div>

          {/* Winner Photo / Prize Display */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
            {currentWinner.winnerPhoto ? (
              <img
                src={currentWinner.winnerPhoto}
                alt={currentWinner.winnerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-5xl">🏆</div>
            )}
          </div>
        </div>

        {/* Text Announcements */}
        <div className="text-center space-y-2">
          <h3 className="text-gray-900 font-extrabold text-lg sm:text-xl tracking-wide uppercase">
            CONGRATULATIONS!
          </h3>
          <p className="text-red-600 font-extrabold text-base sm:text-lg leading-snug px-2">
            {currentWinner.winnerName} On Winning {currentWinner.itemName}
          </p>
          <div className="pt-2 text-xs sm:text-sm text-gray-500 font-semibold space-y-1">
            <p>Ticket Number: {currentWinner.ticketNumber}</p>
            <p>Announced on: {currentWinner.announcedDate}</p>
          </div>
        </div>

        {/* Pagination Dots */}
        {displayWinners.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {displayWinners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-red-600 w-4' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
