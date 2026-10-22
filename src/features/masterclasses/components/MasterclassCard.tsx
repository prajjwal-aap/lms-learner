"use client";

import { CircleCheck, User } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { ProductThumb } from "@/components/ui/ProductThumb";
import { formatSlot, TYPE_LABEL, type CatalogProduct } from "@/features/catalog";
import { StartCountdown } from "./StartCountdown";

type Props = { product: CatalogProduct; registered: boolean };

/** Catalogue card for a masterclass / webinar: thumbnail with countdown + type chips, mentor, next slot, price and CTA. */
export function MasterclassCard({ product: p, registered }: Props) {
  const href = ROUTES.product(p.slug);
  const off = p.price.mrp_paise > p.price.price_paise;

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
      <Link href={href} className="relative bg-slate-900 h-44 overflow-hidden group block">
        <ProductThumb src={p.thumbnail_url} title={p.title} type={p.type} className="group-hover:scale-105 transition duration-300" />
        {p.next_session_at && <StartCountdown startsAt={p.next_session_at} />}
        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[11px] font-semibold">{TYPE_LABEL[p.type]}</div>
        {p.next_session_at && (
          <div className="absolute bottom-2 left-2.5 bg-brand-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm">{formatSlot(p.next_session_at)}</div>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <User className="w-3.5 h-3.5 shrink-0 text-brand-600" fill="currentColor" />
              By {p.mentors.map((m) => m.display_name).join(", ")}
            </span>
            {p.badges[0] && <span className="font-bold text-amber-600 uppercase">{p.badges[0]}</span>}
          </div>
          <Link href={href}>
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-brand-600">{p.title}</h3>
          </Link>
          {p.subtitle && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.subtitle}</p>}
        </div>
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {p.price.is_free ? (
              <span className="text-lg font-bold text-emerald-600">Free</span>
            ) : (
              <>
                <span className="text-lg font-bold text-slate-900">{p.price.price_display}</span>
                {off && <span className="text-xs text-slate-400 line-through">{p.price.mrp_display}</span>}
              </>
            )}
          </div>
          {registered ? (
            <Link
              href={ROUTES.liveSessions}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <CircleCheck className="size-[11px] shrink-0" />
              Registered
            </Link>
          ) : (
            <Link href={href} className="text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs transition bg-brand-600 hover:bg-brand-700 text-white">
              {p.price.is_free ? "Register free" : "Enroll Now"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
