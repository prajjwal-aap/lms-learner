"use client";

import { ArrowRight, Calendar, Check, CircleCheck, LoaderCircle, ShoppingCartPlus } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { useAddToCart, useCart } from "@/features/cart";
import type { LibraryCard } from "@/features/courses";
import { cn } from "@/lib/utils";
import { discountPct, formatSlot, LANGUAGE_LABEL, LEVEL_LABEL, TYPE_LABEL } from "../lib/labels";
import type { ProductCard as Product } from "../types";
import { ProductThumb } from "@/components/ui/ProductThumb";

/** Live products need a slot picked on the product page, so they skip the quick add-to-cart. */
export const isLiveType = (type: Product["type"]) => type === "WEBINAR" || type === "MASTERCLASS";

type Props = { product: Product; owned?: LibraryCard };

/** Catalog card: thumbnail, title, mentor, chips, price and actions. */
export function ProductCard({ product: p, owned }: Props) {
  const { data: cart } = useCart();
  const add = useAddToCart();
  const inCart = cart?.items.some((i) => i.productId === p.id) ?? false;
  const off = discountPct(p.price.price_paise, p.price.mrp_paise);
  const href = ROUTES.product(p.slug);

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xs transition-all duration-300 hover:shadow-xl">
      <div>
        <Link href={href} className="relative block aspect-[16/9] overflow-hidden">
          <ProductThumb src={p.thumbnail_url} title={p.title} type={p.type} className="transition duration-300 group-hover:scale-105" />
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-xs">
            {TYPE_LABEL[p.type]}
          </span>
          {p.badges[0] && (
            <span className="absolute right-3 top-3 rounded-sm bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-950 shadow-sm">
              {p.badges[0]}
            </span>
          )}
        </Link>
        <div className="space-y-2 p-4">
          <Link href={href}>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition group-hover:text-brand-purple">{p.title}</h3>
          </Link>
          {p.subtitle && <p className="line-clamp-2 text-xs text-gray-500">{p.subtitle}</p>}
          {p.rating && (
            <p className="text-[11px] font-semibold text-gray-700">
              <span className="text-amber-500">★</span> {p.rating.avg.toFixed(1)}
              <span className="ml-1 font-normal text-gray-400">({p.rating.count_display ?? p.rating.count})</span>
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
            {p.mentors[0] && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">{p.mentors[0].display_name}</span>}
            {p.language && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{LANGUAGE_LABEL[p.language]}</span>}
            {p.level && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{LEVEL_LABEL[p.level]}</span>}
          </div>
          {p.next_session_at && (
            <p className="text-[11px] font-semibold text-rose-600">
              <Calendar className="mr-1 inline-block size-[11px] align-[-0.125em]" />
              {formatSlot(p.next_session_at)}
            </p>
          )}
          {p.price.is_free ? (
            <p className="text-lg font-extrabold text-emerald-600">Free</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-extrabold text-gray-900">{p.price.price_display}</span>
              {off > 0 && (
                <>
                  <span className="text-xs text-gray-400 line-through">{p.price.mrp_display}</span>
                  <span className="rounded-sm bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">{off}% OFF</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 p-4 pt-0">
        {owned ? (
          <Link
            href={href}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            <CircleCheck className="size-[11px] shrink-0" />
            Purchased
          </Link>
        ) : (
          <>
            <Link
              href={href}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-purple px-3 py-2.5 text-xs font-bold text-brand-purple transition duration-200 hover:bg-brand-purple hover:text-white"
            >
              {p.price.is_free ? "Enroll free" : isLiveType(p.type) ? "Pick a slot" : "View details"}
              <ArrowRight className="size-2.5 shrink-0" />
            </Link>
            {!p.price.is_free && !isLiveType(p.type) && (
              <button
                type="button"
                onClick={() =>
                  !inCart &&
                  add.mutate({ productId: p.id, productSlug: p.slug, productType: p.type, planId: p.price.plan_id || undefined, title: p.title, price: p.price.price_paise / 100 })
                }
                disabled={add.isPending}
                title={inCart ? "In your cart" : "Add to cart"}
                aria-label={inCart ? `${p.title} is in your cart` : `Add ${p.title} to cart`}
                className={cn(
                  "flex w-10 shrink-0 items-center justify-center rounded-xl border text-xs transition duration-200",
                  inCart ? "border-brand-purple bg-brand-purple text-white" : "border-purple-100 text-brand-purple hover:bg-brand-purple-light",
                )}
              >
                {add.isPending ? <LoaderCircle className="size-3 animate-spin" /> : inCart ? <Check className="size-3" /> : <ShoppingCartPlus className="size-3" />}
              </button>
            )}
          </>
        )}
      </div>
      {add.error && <p className="px-4 pb-3 text-[11px] leading-snug text-red-600">{add.error.message}</p>}
    </article>
  );
}
