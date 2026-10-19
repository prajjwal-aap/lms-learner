import { isMocked } from "@/config/features";
import { api } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import type { AddToCartInput, Cart, CartItem } from "../types";

const mocked = () => isMocked("store");

/** Defensive copy of the server cart: missing lists / totals become empty values instead of crashing the drawer. */
function normalizeCart(raw: Partial<Cart> | null | undefined): Cart {
  const items = (Array.isArray(raw?.items) ? raw.items : []).map((i) => ({
    ...i,
    title: i.title || "Item",
    mrp: Number(i.mrp ?? i.sp ?? 0),
    sp: Number(i.sp ?? 0),
    quantity: Number(i.quantity ?? 1),
    media: i.media ?? null,
  }));
  const subtotal = Number(raw?.subtotal ?? items.reduce((n, i) => n + i.sp * i.quantity, 0));
  return {
    id: String(raw?.id ?? ""),
    status: String(raw?.status ?? "ACTIVE"),
    items,
    subtotal,
    discountAmount: Number(raw?.discountAmount ?? 0),
    payable: Number(raw?.payable ?? subtotal),
    couponCode: raw?.couponCode ?? null,
  };
}

let mockCart: Cart = { id: "mock-cart", status: "ACTIVE", subtotal: 0, discountAmount: 0, payable: 0, couponCode: null, items: [] };

function totals(items: CartItem[], couponCode: string | null): Cart {
  const subtotal = items.reduce((n, i) => n + i.sp * i.quantity, 0);
  // Coupons are stored but not applied yet (§6), so payable = subtotal.
  return { ...mockCart, items, couponCode, subtotal, discountAmount: 0, payable: subtotal };
}

/** GET /og-order/cart — creates an empty cart on first call. */
export async function getCart(): Promise<Cart> {
  if (mocked()) {
    await mockDelay();
    return mockCart;
  }
  return normalizeCart(await api.get<Cart>("/og-order/cart"));
}

/** POST /og-order/cart/items. Digital products stay at quantity 1 (a higher quantity only multiplies the price). */
export async function addToCart(input: AddToCartInput): Promise<Cart> {
  if (mocked()) {
    await mockDelay(150);
    if (mockCart.items.some((i) => i.productSlug === input.productSlug)) return mockCart;
    // Dynamic import: the catalog's product cards import the cart, so a static import would be circular.
    const { getProductPage } = await import("@/features/catalog");
    const p = (await getProductPage(input.productSlug))?.product;
    if (!p) throw new Error(`Product not found: ${input.productSlug}`);
    const item: CartItem = {
      id: `ci-${Date.now()}`,
      productId: p.id,
      productSlug: p.slug,
      productType: input.productType,
      title: p.title,
      mrp: p.price.mrp_paise / 100,
      sp: p.price.price_paise / 100,
      quantity: 1,
      batchId: input.batchId ?? null,
      media: p.thumbnail_url,
      addedAt: new Date().toISOString(),
    };
    mockCart = totals([...mockCart.items, item], mockCart.couponCode);
    return mockCart;
  }
  return normalizeCart(await api.post<Cart>("/og-order/cart/items", { ...input, quantity: 1 }));
}

/** DELETE /og-order/cart/items/:itemId */
export async function removeCartItem(itemId: string): Promise<Cart> {
  if (mocked()) {
    await mockDelay(120);
    mockCart = totals(
      mockCart.items.filter((i) => i.id !== itemId),
      mockCart.couponCode,
    );
    return mockCart;
  }
  return normalizeCart(await api.delete<Cart>(`/og-order/cart/items/${encodeURIComponent(itemId)}`));
}

/** POST /og-order/cart/coupon — the code is stored; discounts aren't active on the server yet. */
export async function applyCoupon(couponCode: string): Promise<Cart> {
  const code = couponCode.trim().toUpperCase();
  if (!code) throw new Error("Enter a coupon code");
  if (mocked()) {
    await mockDelay(150);
    mockCart = totals(mockCart.items, code);
    return mockCart;
  }
  return normalizeCart(await api.post<Cart>("/og-order/cart/coupon", { couponCode: code }));
}

/** DELETE /og-order/cart/coupon */
export async function removeCoupon(): Promise<Cart> {
  if (mocked()) {
    await mockDelay(120);
    mockCart = totals(mockCart.items, null);
    return mockCart;
  }
  return normalizeCart(await api.delete<Cart>("/og-order/cart/coupon"));
}

/** DELETE /og-order/cart — empties the cart. */
export async function clearCart(): Promise<Cart> {
  if (mocked()) {
    await mockDelay(120);
    mockCart = totals([], null);
    return mockCart;
  }
  return normalizeCart(await api.delete<Cart>("/og-order/cart"));
}

/** After a cart checkout the server locks the cart and hands out a new empty one. */
export function resetMockCartAfterCheckout() {
  if (mocked()) mockCart = { ...totals([], null), id: `mock-cart-${Date.now()}` };
}
