'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Clock, Users, Ticket, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageUrl';
import { convertNairaToPoints } from '@/lib/constants';
import RafflePointsIcon from '@/components/ui/RafflePointsIcon';
import Link from 'next/link';

interface RaffleItem {
  id: number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
  description?: string;
}

interface ItemBottomSheetProps {
  item: RaffleItem | null;
  onClose: () => void;
  isAuthenticated: boolean;
}

export default function ItemBottomSheet({
  item,
  onClose,
  isAuthenticated,
}: ItemBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      // Small delay for animation
      requestAnimationFrame(() => setIsVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Touch handling for drag-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 120) {
      handleClose();
    }
    setTranslateY(0);
  };

  if (!item) return null;

  const imageUrl = resolveImageUrl(item.image);
  const progressPercent = Math.round(
    (item.ticketsSold / item.ticketsTotal) * 100,
  );
  const ticketsRemaining = item.ticketsTotal - item.ticketsSold;
  const pointsPrice = convertNairaToPoints(item.ticketPrice);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-[101] transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        style={{
          transform: isVisible
            ? `translateY(${translateY}px)`
            : 'translateY(100%)',
          transition: isDragging ? 'none' : undefined,
        }}
      >
        <div className="bg-white rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Drag Handle */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {/* Image — Large and Prominent */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain bg-white"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-8xl">
                  📦
                </div>
              )}

              {/* Status Badge */}
              {item.status === 'active' ? (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              ) : (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                  ENDED
                </div>
              )}

              {/* Countdown badge */}
              {item.status === 'active' && (
                <div className="absolute top-4 right-14 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full shadow-sm">
                  <Clock size={13} className="text-red-500" />
                  {item.endsIn}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="px-5 py-5 space-y-5">
              {/* Name */}
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {item.name}
              </h2>

              {/* Description if available */}
              {item.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Price & Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-xl p-3.5">
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Points per ticket
                  </p>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                    <RafflePointsIcon size={18} className="text-amber-500" />
                    {pointsPrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3.5">
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Tickets left
                  </p>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                    <Ticket size={18} className="text-blue-500" />
                    {ticketsRemaining.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                    <Users size={14} />
                    {item.ticketsSold}/{item.ticketsTotal} sold
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fixed CTA at bottom */}
          <div className="px-5 pb-6 pt-3 border-t border-gray-100 bg-white">
            {item.status === 'active' ? (
              isAuthenticated ? (
                <Link
                  href="/dashboard/items"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-base rounded-2xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/25 active:scale-[0.98]"
                  onClick={handleClose}
                >
                  <RafflePointsIcon size={18} className="text-yellow-300" />
                  Use {pointsPrice.toLocaleString()} pts — Get Ticket
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-base rounded-2xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-600/25 active:scale-[0.98]"
                >
                  Login to Buy Ticket
                  <ChevronRight size={18} />
                </Link>
              )
            ) : (
              <button
                disabled
                className="w-full py-3.5 bg-gray-100 text-gray-400 font-bold text-base rounded-2xl cursor-not-allowed"
              >
                Draw Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
