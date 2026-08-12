import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Returns the per-user ticket limit based on total ticket pool size. */
export function getPerUserLimit(ticketsTotal: number): number {
  if (ticketsTotal >= 100) return 10;
  if (ticketsTotal < 10) return 1;
  return 3;
}

export interface CartItem {
  raffleId: string;
  itemId: string;
  title: string;
  imageUrl: string;
  ticketPrice: number;
  quantity: number;
  maxTicketsAvailable: number;
  /** Per-user policy limit: 10 if ticketsTotal >= 100, else 3 */
  perUserLimit: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (raffleId: string) => void;
  updateQuantity: (raffleId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addToCart: (newItem, quantity = 1) => {
        set((state) => {
          // Hard cap: the lower of (tickets remaining) and (per-user policy limit)
          const maxCap = Math.min(
            newItem.maxTicketsAvailable || newItem.perUserLimit,
            newItem.perUserLimit
          );

          const existingIndex = state.items.findIndex(
            (i) => i.raffleId === newItem.raffleId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex]!;
            const newQty = Math.min(existing.quantity + quantity, maxCap);
            updatedItems[existingIndex] = { ...existing, quantity: newQty };
            return { items: updatedItems };
          } else {
            return {
              items: [
                ...state.items,
                { ...newItem, quantity: Math.min(quantity, maxCap) },
              ],
            };
          }
        });
      },

      removeFromCart: (raffleId) => {
        set((state) => ({
          items: state.items.filter((i) => i.raffleId !== raffleId),
        }));
      },

      updateQuantity: (raffleId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(raffleId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.raffleId === raffleId) {
              const maxAllowed = Math.min(
                i.maxTicketsAvailable || i.perUserLimit,
                i.perUserLimit
              );
              return { ...i, quantity: Math.min(quantity, maxAllowed) };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () =>
        get().items.reduce((total, item) => total + item.ticketPrice * item.quantity, 0),

      getCartCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    { name: 'raffle-ticket-cart' }
  )
);
