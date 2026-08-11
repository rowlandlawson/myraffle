'use client';

import { useState } from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
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

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to complete your checkout');
      window.location.href = '/login';
      return;
    }

    if (items.length === 0) return;

    // Default checkout with the first or aggregated item
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-[80]">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-lg">Your Ticket Cart</h2>
                <p className="text-xs text-gray-500">{items.length} item(s) selected</p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="font-bold text-gray-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore active raffles and add tickets to your cart to participate!
                </p>
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow hover:bg-red-700 transition"
                >
                  Browse Raffles
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.raffleId}
                  className="flex gap-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 relative group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover bg-white border border-gray-200"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-red-600 font-extrabold mt-0.5">
                      ₦{item.ticketPrice.toLocaleString()} / ticket
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.raffleId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.raffleId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-gray-700">
                        = ₦{(item.ticketPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.raffleId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} tickets)</span>
                  <span className="font-bold text-gray-800">₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total Amount</span>
                  <span className="text-red-600 text-base">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck size={14} className="text-green-500" />
                <span>Monnify & Wallet Verified Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal triggered from Cart */}
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
