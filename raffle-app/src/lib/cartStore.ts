import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  raffleId: string;
  itemId: string;
  title: string;
  imageUrl: string;
  ticketPrice: number;
  quantity: number;
  maxTicketsAvailable: number;
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
          const existingIndex = state.items.findIndex(
            (i) => i.raffleId === newItem.raffleId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex]!;
            const newQty = Math.min(
              existing.quantity + quantity,
              newItem.maxTicketsAvailable || 100
            );
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQty,
            };
            return { items: updatedItems, isOpen: true };
          } else {
            return {
              items: [
                ...state.items,
                {
                  ...newItem,
                  quantity: Math.min(quantity, newItem.maxTicketsAvailable || 100),
                },
              ],
              isOpen: true,
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
              const maxAllowed = i.maxTicketsAvailable || 100;
              return { ...i, quantity: Math.min(quantity, maxAllowed) };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.ticketPrice * item.quantity,
          0
        );
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'raffle-ticket-cart',
    }
  )
);
