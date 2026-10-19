"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ROUTES } from "@/config/routes";
import { ProductThumb } from "@/components/ui/ProductThumb";
import { formatINR } from "@/lib/utils";
import { useApplyCoupon, useCart, useClearCart, useRemoveCartItem, useRemoveCoupon } from "../api/cart.queries";
import { useCartUi } from "../store";

const TYPE_LABEL: Record<string, string> = {
  COURSE: "Course",
  SELF_PLACED: "Course",
  BUNDLE: "Bundle",
  EBOOK: "E-book",
  WEBINAR: "Webinar",
  MASTERCLASS: "Masterclass",
};

/** Right-hand cart sheet: items, coupon, totals and Checkout. */
export function CartDrawer() {
  const open = useCartUi((s) => s.drawerOpen);
  const close = useCartUi((s) => s.closeDrawer);
  const startCheckout = useCartUi((s) => s.startCheckout);
  const { data: cart, isLoading, error } = useCart();
  const remove = useRemoveCartItem();
  const clear = useClearCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    // Lock the page behind the sheet.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!open) return null;

  const items = cart?.items ?? [];
  const savings = items.reduce((n, i) => n + Math.max(0, i.mrp - i.sp) * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden="true" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-level-3">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <h2 id="cart-title" className="text-lg font-bold text-gray-900">
            Your cart{items.length > 0 && <span className="ml-2 text-sm font-medium text-gray-500">({items.length})</span>}
          </h2>
          <button type="button" onClick={close} aria-label="Close cart" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <i className="fa-solid fa-xmark" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error.message}</p>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-600">
                <i className="fa-solid fa-cart-shopping" />
              </span>
              <p className="text-sm font-semibold text-gray-900">Your cart is empty</p>
              <p className="text-xs text-gray-500">Courses, e-books and live classes you add will show up here.</p>
              <Link href={ROUTES.store} onClick={close} className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Browse courses
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                  <Link href={ROUTES.product(i.productSlug)} onClick={close} className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                    <ProductThumb src={i.media} title={i.title} type={i.productType} compact />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={ROUTES.product(i.productSlug)} onClick={close} className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 hover:text-brand-700">
                      {i.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">{TYPE_LABEL[i.productType] ?? i.productType}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-sm">
                        <span className="font-bold text-gray-900">{formatINR(i.sp)}</span>
                        {i.mrp > i.sp && <span className="ml-1.5 text-xs text-gray-400 line-through">{formatINR(i.mrp)}</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove.mutate(i.id)}
                        disabled={remove.isPending && remove.variables === i.id}
                        className="text-xs font-semibold text-gray-500 hover:text-red-600 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {remove.error && <p className="mt-3 text-xs text-red-600">{remove.error.message}</p>}
        </div>

        {cart && items.length > 0 && (
          <footer className="shrink-0 space-y-4 border-t border-gray-200 px-5 py-4">
            <CouponField code={cart.couponCode} />
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <dt>Subtotal</dt>
                <dd>{formatINR(cart.subtotal)}</dd>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd>− {formatINR(cart.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900">
                <dt>Total</dt>
                <dd>{formatINR(cart.payable)}</dd>
              </div>
              {savings > 0 && <p className="text-right text-xs font-medium text-emerald-700">You save {formatINR(savings)} on list price</p>}
            </dl>
            <button
              type="button"
              onClick={() => startCheckout({ mode: "cart", couponCode: cart.couponCode })}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700"
            >
              Checkout · {formatINR(cart.payable)}
            </button>
            <button
              type="button"
              onClick={() => clear.mutate(undefined)}
              disabled={clear.isPending}
              className="w-full text-center text-xs font-semibold text-gray-500 hover:text-red-600 disabled:opacity-50"
            >
              Clear cart
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

function CouponField({ code }: { code: string | null }) {
  const apply = useApplyCoupon();
  const remove = useRemoveCoupon();
  const [draft, setDraft] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    apply.mutate(draft, { onSuccess: () => setDraft("") });
  };

  if (code) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-sm">
        <span className="text-emerald-800">
          <i className="fa-solid fa-ticket mr-2" />
          <strong>{code}</strong> added
        </span>
        <button type="button" onClick={() => remove.mutate(undefined)} disabled={remove.isPending} className="text-xs font-semibold text-emerald-800 hover:underline">
          Remove
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Coupon code"
          aria-label="Coupon code"
          className="min-w-0 flex-1 rounded-lg border-gray-200 px-3 py-2 text-sm uppercase placeholder:normal-case focus:border-brand-500 focus:ring-brand-200"
        />
        <button type="submit" disabled={!draft.trim() || apply.isPending} className="rounded-lg border border-brand-600 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50">
          Apply
        </button>
      </div>
      {apply.error && <p className="mt-1.5 text-xs text-red-600">{apply.error.message}</p>}
    </form>
  );
}
