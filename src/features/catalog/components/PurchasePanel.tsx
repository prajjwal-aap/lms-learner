"use client";

import { Award, CircleCheck, CirclePlay, Clock, ShoppingCart, ShoppingCartPlus, Users, Video, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/config/routes";
import { useAddToCart, useCart, useCartUi } from "@/features/cart";
import { useEnrollFree, type LibraryCard } from "@/features/courses";
import { useRegisterFree } from "@/features/live-sessions";
import { cn } from "@/lib/utils";
import { discountPct, formatSlot } from "../lib/labels";
import type { Plan, ProductPage } from "../types";
import { isLiveType } from "./ProductCard";
import { ProductThumb } from "@/components/ui/ProductThumb";

function validityLabel(plan: Plan) {
  const v = plan.validity;
  if (v.type === "LIFETIME") return "Lifetime access";
  if (v.type === "DAYS" && v.days) return v.days % 365 === 0 ? `${v.days / 365} year access` : `${v.days} days access`;
  if (v.type === "FIXED_END" && v.end_date) return `Access till ${new Date(v.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  return "Access till the event ends";
}

const INCLUDES: { key: keyof Plan["includes"]; label: string; icon: LucideIcon }[] = [
  { key: "live", label: "Live classes", icon: Video },
  { key: "recordings", label: "Recordings", icon: CirclePlay },
  { key: "certificate", label: "Certificate", icon: Award },
  { key: "community", label: "Community access", icon: Users },
];

type Props = { page: ProductPage; owned?: LibraryCard; ownedHref?: string };

/** Sticky buy box: plan + slot pickers, price, and the right CTA (buy, cart, enroll free, register free, owned). */
export function PurchasePanel({ page, owned, ownedHref }: Props) {
  const { product, plans } = page;
  // The API only returns upcoming slots; closed ones stay listed but can't be picked.
  const sessions = page.upcoming_sessions ?? [];
  const live = isLiveType(product.type);
  const [planId, setPlanId] = useState(() => (plans.find((p) => p.is_default) ?? plans[0])?.id);
  const [sessionId, setSessionId] = useState(() => sessions.find((s) => s.registration_open)?.id);
  const plan = plans.find((p) => p.id === planId);
  const session = sessions.find((s) => s.id === sessionId);

  const { data: cart } = useCart();
  const add = useAddToCart();
  const startCheckout = useCartUi((s) => s.startCheckout);
  const enroll = useEnrollFree();
  const register = useRegisterFree();
  const inCart = cart?.items.some((i) => i.productId === product.id) ?? false;

  const free = plan ? plan.type === "FREE" || plan.price_paise === 0 : product.price.is_free;
  const pricePaise = plan?.price_paise ?? product.price.price_paise;
  const mrpPaise = plan?.mrp_paise ?? product.price.mrp_paise;
  const off = discountPct(pricePaise, mrpPaise);
  const needsSlot = live && sessions.length > 0;
  const slotMissing = needsSlot && !session;
  // The app cart carries planId + liveSessionId, so any paid plan can go in; live products need a slot picked first.
  const canCart = !free && (!live || !!session);
  const freeDone = enroll.isSuccess || register.isSuccess;
  const freeError = enroll.error ?? register.error;

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-level-2">
      <div className="aspect-[16/9] overflow-hidden">
        <ProductThumb src={product.banner_url ?? product.thumbnail_url} title={product.title} type={product.type} />
      </div>
      <div className="space-y-5 p-5">
        {owned ? (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-emerald-700">
              <CircleCheck className="mr-1.5 inline-block size-3.5 align-[-0.125em]" />
              You own this {product.type === "EBOOK" ? "e-book" : product.type.toLowerCase()}
            </p>
            <Link href={ownedHref ?? ROUTES.courses} className="block w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700">
              {product.type === "EBOOK" ? "Read now" : live ? "Go to Live Sessions" : "Go to course"}
            </Link>
          </div>
        ) : (
          <>
            {plans.length > 1 && (
              <fieldset className="space-y-2">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Choose a plan</legend>
                {plans.map((p) => (
                  <label
                    key={p.id}
                    className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition", p.id === planId ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300")}
                  >
                    <input type="radio" name="plan" checked={p.id === planId} onChange={() => setPlanId(p.id)} className="mt-1 text-brand-600 focus:ring-brand-500" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                        <span className="text-sm font-bold text-gray-900">{p.type === "FREE" ? "Free" : p.price_display}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">{validityLabel(p)}</span>
                      {p.sale_ends_at && <span className="mt-0.5 block text-[11px] font-semibold text-rose-600">Offer ends {formatSlot(p.sale_ends_at)}</span>}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}

            {needsSlot && (
              <fieldset className="space-y-2">
                <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Choose a slot</legend>
                {sessions.map((s) => (
                  <label
                    key={s.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 transition",
                      !s.registration_open ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                      s.id === sessionId ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="slot"
                      disabled={!s.registration_open}
                      checked={s.id === sessionId}
                      onChange={() => setSessionId(s.id)}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">{formatSlot(s.scheduled_at)}</span>
                      <span className="mt-0.5 block text-xs text-gray-500">
                        {s.duration_min} min{s.seats_left !== null && ` • ${s.seats_left} seats left`}
                        {!s.registration_open && " • Registration closed"}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            {live && sessions.length === 0 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">No upcoming slots right now. Check back soon.</p>}

            <div className="flex items-end gap-2">
              {free ? (
                <span className="text-3xl font-black text-emerald-600">Free</span>
              ) : (
                <>
                  <span className="text-3xl font-black text-gray-900">{plan?.price_display ?? product.price.price_display}</span>
                  {off > 0 && (
                    <>
                      <span className="pb-1 text-sm text-gray-400 line-through">{plan?.mrp_display ?? product.price.mrp_display}</span>
                      <span className="mb-1 rounded-sm bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-600">{off}% OFF</span>
                    </>
                  )}
                </>
              )}
            </div>

            {freeDone ? (
              <div className="space-y-3 rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-800">
                  <CircleCheck className="mr-1.5 inline-block size-3.5 align-[-0.125em]" />
                  {live ? "You're registered!" : "You're enrolled!"}
                </p>
                <Link href={live ? ROUTES.liveSessions : ROUTES.courses} className="block rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
                  {live ? "Go to Live Sessions" : "Go to My Learnings"}
                </Link>
              </div>
            ) : free ? (
              <button
                type="button"
                disabled={slotMissing || enroll.isPending || register.isPending}
                onClick={() => (live && session ? register.mutate(session.id) : enroll.mutate(product.id))}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {enroll.isPending || register.isPending ? "Please wait…" : live ? "Register for free" : "Enroll for free"}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={slotMissing || (live && sessions.length === 0)}
                  onClick={() =>
                    startCheckout({
                      mode: "buy",
                      productId: product.id,
                      productType: product.type,
                      title: session ? `${product.title} — ${formatSlot(session.scheduled_at)}` : product.title,
                      amount: pricePaise / 100,
                      planId: plan?.id,
                      liveSessionId: session?.id,
                    })
                  }
                  className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {page.page.hero?.cta_text || "Buy now"}
                </button>
                {canCart && (
                  <button
                    type="button"
                    onClick={() =>
                      inCart
                        ? useCartUi.getState().openDrawer()
                        : add.mutate({
                            productId: product.id,
                            productSlug: product.slug,
                            productType: product.type,
                            planId: plan?.id,
                            liveSessionId: session?.id,
                            title: product.title,
                            price: pricePaise / 100,
                          })
                    }
                    disabled={add.isPending}
                    className="w-full rounded-xl border border-brand-600 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
                  >
                    {inCart ? (
                      <ShoppingCart className="mr-2 inline-block size-3.5 align-[-0.125em]" />
                    ) : (
                      <ShoppingCartPlus className="mr-2 inline-block size-3.5 align-[-0.125em]" />
                    )}
                    {inCart ? "In cart — view cart" : add.isPending ? "Adding…" : "Add to cart"}
                  </button>
                )}
              </div>
            )}
            {(freeError ?? add.error) && <p className="text-xs text-red-600">{(freeError ?? add.error)?.message}</p>}
          </>
        )}

        {plan && (
          <ul className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
            <li className="col-span-2 font-semibold text-gray-800">
              <Clock className="mr-1.5 inline-block size-3 align-[-0.125em] text-brand-600" />
              {validityLabel(plan)}
            </li>
            {INCLUDES.filter((i) => plan.includes[i.key]).map((i) => (
              <li key={i.key}>
                <i.icon className="mr-1.5 inline-block size-3 align-[-0.125em] text-brand-600" />
                {i.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
