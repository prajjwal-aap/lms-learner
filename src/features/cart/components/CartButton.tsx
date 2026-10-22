"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "../api/cart.queries";
import { useCartUi } from "../store";
import { CartDrawer } from "./CartDrawer";
import { CheckoutDialog } from "./CheckoutDialog";

/** Header cart icon with item count; owns the cart drawer and the checkout dialog. */
export function CartButton() {
  const { data: cart } = useCart();
  const openDrawer = useCartUi((s) => s.openDrawer);
  const count = cart?.items.length ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-label={count ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
        className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
      >
        <ShoppingCart className="size-[17px]" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </button>
      <CartDrawer />
      <CheckoutDialog />
    </>
  );
}
