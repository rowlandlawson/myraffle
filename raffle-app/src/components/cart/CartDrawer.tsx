'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import TicketCheckoutModal from '@/components/shared/TicketCheckoutModal';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<{
    raffleId: string;
    itemTitle: string;
    imageUrl: string;
    ticketPrice: number;
    quantity: number;
  } | null>(null);

  if (!isOpen) return null;

  const total = getCartTotal();
  const totalTickets = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to checkout');
      window.location.href = '/login';
      return;
    }
    if (items.length === 0) return;

    const firstItem = items[0]!;
    setSelectedCartItem({
      raffleId: firstItem.raffleId,
      itemTitle: items.length === 1 ? firstItem.title : `${items.length} Raffle Items`,
      imageUrl: firstItem.imageUrl || '',
      ticketPrice: firstItem.ticketPrice,
      quantity: firstItem.quantity,
    });
    setCheckoutModalOpen(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
        onClick={closeCart}
      />

      {/* Native bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[80] max-w-xl mx-auto">
        <div className="bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh]">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <ShoppingBag size={18} className="text-[#C0000C]" />
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-base">Your Cart</h2>
                <p className="text-xs text-gray-400">
                  {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} · ₦{total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all items from cart?')) clearCart();
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium px-2 py-1"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={closeCart}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag size={28} className="text-gray-300" />
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-sm">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Browse live raffles and add tickets to get started
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="mt-1 px-5 py-2.5 bg-[#C0000C] text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Browse Raffles
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.raffleId}
                  className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-[#C0000C] font-bold mt-0.5">
                      ₦{item.ticketPrice.toLocaleString()} / ticket
                    </p>

                    {/* Qty + subtotal row */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.raffleId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const limit = item.perUserLimit || 10;
                            if (item.quantity >= limit) {
                              toast.error(`Max ${limit} tickets allowed per user for this draw`);
                              return;
                            }
                            updateQuantity(item.raffleId, item.quantity + 1);
                          }}
                          disabled={item.quantity >= (item.perUserLimit || 10)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-800">
                        ₦{(item.ticketPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.raffleId)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors self-start mt-0.5"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 space-y-3 bg-white">
              {/* Total row */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Total ({totalTickets} ticket{totalTickets !== 1 ? 's' : ''})
                </span>
                <span className="text-lg font-black text-gray-900">₦{total.toLocaleString()}</span>
              </div>

              {/* Checkout button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-4 bg-[#C0000C] hover:bg-red-700 text-white font-black text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.99]"
              >
                Proceed to Checkout
                <ChevronRight size={18} />
              </button>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Secured checkout · Wallet &amp; card accepted</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedCartItem && (
        <TicketCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => {
            setCheckoutModalOpen(false);
            setSelectedCartItem(null);
            clearCart();
            closeCart();
          }}
          item={{
            id: selectedCartItem.raffleId,
            name: selectedCartItem.itemTitle,
            image: selectedCartItem.imageUrl,
            ticketPrice: selectedCartItem.ticketPrice * selectedCartItem.quantity,
            ticketsSold: 0,
            ticketsTotal: 100,
            status: 'active',
            endsIn: 'Active',
          }}
        />
      )}
    </>
  );
}
