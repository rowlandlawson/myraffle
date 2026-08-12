'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Clock, Users, Ticket, ShoppingBag, CheckCircle2, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageUrl';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TicketCheckoutModal from './TicketCheckoutModal';
import { useCartStore, getPerUserLimit } from '@/lib/cartStore';
import CountdownTimer from './CountdownTimer';

import { useAuthStore } from '@/lib/authStore';

interface RaffleItem {
  id: string | number;
  name: string;
  image: string;
  ticketPrice: number;
  ticketsSold: number;
  ticketsTotal: number;
  status: 'active' | 'completed';
  endsIn: string;
  description?: string;
  raffleDate?: string | Date;
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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const dragStartY = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const isAdmin = (user as any)?.role === 'ADMIN';

  useEffect(() => {
    if (item) {
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

  const handleAddToCart = () => {
    if (!item) return;
    if (isAdmin) {
      toast.error('Admins cannot participate in raffles');
      return;
    }
    const maxTickets = Math.max(0, item.ticketsTotal - item.ticketsSold);
    const perUserLimit = getPerUserLimit(item.ticketsTotal);
    addToCart(
      {
        raffleId: String(item.id),
        itemId: String(item.id),
        title: item.name,
        imageUrl: resolveImageUrl(item.image) || item.image,
        ticketPrice: item.ticketPrice,
        maxTicketsAvailable: maxTickets,
        perUserLimit,
      },
      1
    );
    setAddedToCart(true);
    toast.success(`Ticket added! (max ${perUserLimit} per person)`);
    // Reset the checkmark after 2s
    setTimeout(() => setAddedToCart(false), 2000);
  };

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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet on Mobile / Centered Modal on Large Screens */}
      <div
        ref={sheetRef}
        className={`fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`bg-white w-full max-w-xl rounded-t-3xl md:rounded-3xl max-h-[92vh] md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl pointer-events-auto transition-all duration-300 ease-out relative ${
            isVisible ? 'translate-y-0 md:scale-100' : 'translate-y-full md:translate-y-0 md:scale-95'
          }`}
          style={{
            transform: isVisible && translateY !== 0
              ? `translateY(${translateY}px)`
              : undefined,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {/* Drag Handle (Mobile only) */}
          <div
            className="flex md:hidden justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {/* Image Container with Yellow background accent */}
            <div className="relative w-full aspect-[4/3] bg-yellow-400 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-7xl">📦</div>
              )}

              {/* Status Badge */}
              {item.status === 'active' ? (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-extrabold rounded-md shadow-sm">
                  LIVE DRAW
                </div>
              ) : (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-md">
                  ENDED
                </div>
              )}
            </div>

            {/* Details */}
            <div className="px-5 py-5 space-y-5">
              {/* Name */}
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                {item.name}
              </h2>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Price & Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-2xl p-3.5 border border-red-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    Price Per Ticket
                  </p>
                  <p className="text-lg font-black text-red-600">
                    {item.ticketPrice.toLocaleString()} NGN
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    Tickets Remaining
                  </p>
                  <p className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <Ticket size={18} className="text-yellow-500" />
                    {ticketsRemaining.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Countdown Timer */}
              {item.raffleDate && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-red-500 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-slate-300">Raffle Countdown</p>
                      <p className="text-[10px] text-slate-400 font-medium">Ends automatically when timer hits zero</p>
                    </div>
                  </div>
                  <CountdownTimer targetDate={item.raffleDate} />
                </div>
              )}

              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                    <Users size={14} />
                    {item.ticketsSold}/{item.ticketsTotal} sold
                  </span>
                  <span className="text-xs font-extrabold text-red-600">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fixed CTA at bottom */}
          <div className="px-5 pt-3 pb-6 md:pb-6 border-t border-gray-100 bg-white space-y-2.5">
            {item.status === 'active' ? (
              <>
                {/* Primary: Buy Ticket */}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      if (isAdmin) {
                        toast.error('Admins cannot participate in raffles');
                        return;
                      }
                      setCheckoutOpen(true);
                    }}
                    className="w-full py-4 bg-[#C0000C] hover:bg-red-700 text-white font-black text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.99]"
                  >
                    Buy Ticket Now
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-full py-4 bg-[#C0000C] hover:bg-red-700 text-white font-black text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    Login to Buy <ChevronRight size={18} />
                  </Link>
                )}

                {/* Secondary: Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 border-2 active:scale-[0.99] ${
                    addedToCart
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {addedToCart ? (
                    <><CheckCircle2 size={17} /> Added to Cart</>
                  ) : (
                    <><ShoppingBag size={17} /> Add to Cart</>  
                  )}
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-gray-100 text-gray-400 font-bold text-base rounded-2xl cursor-not-allowed"
              >
                Draw Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Checkout Modal */}
      <TicketCheckoutModal
        item={item}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
