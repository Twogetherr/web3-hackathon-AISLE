import { create } from "zustand";
import type { CartItemSnapshot } from "../types/cart";

interface CartStoreState {
  items: CartItemSnapshot[];
  isCartOpen: boolean;
  addItem: (item: CartItemSnapshot) => void;
  clearCart: () => void;
}

/**
 * Zustand store for anonymous cart state and optimistic UI updates.
 */
export const useCartStore = create<CartStoreState>((set) => ({
  items: [],
  isCartOpen: false,
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (candidate) => candidate.productId === item.productId
      );

      if (existingItem === undefined) {
        return {
          items: [...state.items, item]
        };
      }

      return {
        items: state.items.map((candidate) =>
          candidate.productId === item.productId
            ? { ...candidate, quantity: candidate.quantity + item.quantity }
            : candidate
        )
      };
    }),
  clearCart: () =>
    set({
      items: []
    })
}));
