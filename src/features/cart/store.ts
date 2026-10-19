"use client";

import { create } from "zustand";
import type { CheckoutRequest } from "./types";

type CartUiState = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Non-null while the checkout dialog is open. */
  checkout: CheckoutRequest | null;
  startCheckout: (request: CheckoutRequest) => void;
  endCheckout: () => void;
};

/** UI state shared by the header cart button, the drawer, product pages and the checkout dialog. */
export const useCartUi = create<CartUiState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  checkout: null,
  startCheckout: (request) => set({ checkout: request, drawerOpen: false }),
  endCheckout: () => set({ checkout: null }),
}));
