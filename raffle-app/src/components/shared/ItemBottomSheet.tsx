'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Clock, Users, Ticket, ChevronRight, ShoppingBag } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageUrl';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TicketCheckoutModal from './TicketCheckoutModal';
import { useCartStore } from '@/lib/cartStore';

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
  const { addToCart, openCart } = useCartStore();
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

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

    const maxTickets = Math.max(0, item.ticketsTotal - item.ticketsSold);

    addToCart(
      {
        raffleId: String(item.id),
        itemId: String(item.id),
        title: item.name,
        imageUrl: resolveImageUrl(item.image) || item.image,
        ticketPrice: item.ticketPrice,
        maxTicketsAvailable: maxTickets,
      },
      1
    );

    toast.success(`${item.name} added to cart! 🛒`);
    handleClose();
    openCart();
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

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-[120] transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transform: isVisible
            ? `translateY(${translateY}px)`
            : 'translateY(100%)',
          transition: isDragging ? 'none' : undefined,
        }}
      >
        <div className="bg-white rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl max-w-xl mx-auto">
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

          {/* Fixed CTA at bottom with padding above mobile bottom navbar */}
          <div className="px-5 pt-3 pb-20 md:pb-6 border-t border-gray-100 bg-white">
            {item.status === 'active' ? (
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-sm rounded-2xl transition-all shadow flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    Buy Ticket
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    Login to Buy
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
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

      {/* Ticket Checkout Modal */}
      <TicketCheckoutModal
        item={item}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
