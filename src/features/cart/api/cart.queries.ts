"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commerceParams, track } from "@/lib/analytics";
import { useCartUi } from "../store";
import type { AddToCartInput, Cart } from "../types";
import { addToCart, applyCoupon, clearCart, getCart, removeCartItem, removeCoupon } from "./cart.api";
import { listFamilyMembers } from "./checkout.api";

export const cartKeys = {
  cart: ["cart"] as const,
  family: ["cart", "family-members"] as const,
};

export const useCart = () => useQuery({ queryKey: cartKeys.cart, queryFn: getCart });

/** Every cart call returns the full cart, so mutations just replace the cached copy. */
function useCartMutation<V>(fn: (vars: V) => Promise<Cart>, after?: (cart: Cart, vars: V) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart, vars) => {
      qc.setQueryData(cartKeys.cart, cart);
      after?.(cart, vars);
    },
  });
}

/** Adds a product and opens the cart drawer so the learner sees it landed. */
export function useAddToCart() {
  const openDrawer = useCartUi((s) => s.openDrawer);
  return useCartMutation(
    (input: AddToCartInput & { title: string; price: number }) =>
      addToCart({ productSlug: input.productSlug, productType: input.productType, batchId: input.batchId }),
    (_cart, input) => {
      track("add_to_cart", commerceParams([{ item_id: input.productSlug, item_name: input.title, item_category: input.productType, price: input.price, quantity: 1 }]));
      openDrawer();
    },
  );
}

export const useRemoveCartItem = () => useCartMutation(removeCartItem);
export const useApplyCoupon = () => useCartMutation(applyCoupon);
export const useRemoveCoupon = () => useCartMutation(() => removeCoupon());
export const useClearCart = () => useCartMutation(() => clearCart());

export const useFamilyMembers = (enabled: boolean) => useQuery({ queryKey: cartKeys.family, queryFn: listFamilyMembers, enabled });
