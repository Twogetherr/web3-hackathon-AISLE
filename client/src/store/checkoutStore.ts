import { create } from "zustand";
import type { CartItemSnapshot } from "../types/cart";
import type { OrderConfirmation } from "../types/checkout";
import { getStoredWalletAddress, setStoredWalletAddress } from "../lib/session";

interface CheckoutStoreState {
  isOpen: boolean;
  items: CartItemSnapshot[];
  walletAddress: string;
  lastOrder: OrderConfirmation | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  open: (items: CartItemSnapshot[]) => void;
  close: () => void;
  setWalletAddress: (walletAddress: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setLastOrder: (lastOrder: OrderConfirmation | null) => void;
  setErrorMessage: (errorMessage: string | null) => void;
}

/**
 * Zustand store for the shared checkout modal and payment state.
 */
export const useCheckoutStore = create<CheckoutStoreState>((set) => ({
  isOpen: false,
  items: [],
  walletAddress: getStoredWalletAddress(),
  lastOrder: null,
  errorMessage: null,
  isSubmitting: false,
  open: (items) =>
    set({
      isOpen: true,
      items,
      lastOrder: null,
      errorMessage: null
    }),
  close: () =>
    set({
      isOpen: false,
      errorMessage: null,
      isSubmitting: false
    }),
  setWalletAddress: (walletAddress) => {
    setStoredWalletAddress(walletAddress);
    set({ walletAddress });
  },
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setLastOrder: (lastOrder) => set({ lastOrder }),
  setErrorMessage: (errorMessage) => set({ errorMessage })
}));
