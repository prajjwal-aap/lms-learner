"use client";

import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/config/routes";
import { cn, formatINR } from "@/lib/utils";
import { useOrders } from "../api/account.queries";
import { formatOrderDate, orderStatus, productLabel } from "../lib/format";
import { AccountShell, AccountStatus, accountCard } from "./AccountShell";

/** Orders list (GET /og-order), newest first, paged. */
export function PurchaseHistoryScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isPlaceholderData } = useOrders(page);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <AccountShell title="Purchase history" subtitle="Courses, e-books and sessions you've bought.">
      {!data ? (
        <AccountStatus loading={isLoading} error={error} />
      ) : data.orders.length === 0 ? (
        <div className={`${accountCard} text-center`}>
          <p className="text-sm text-gray-500">You haven&apos;t bought anything yet.</p>
          <Link href={ROUTES.store} className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
            Browse courses
          </Link>
        </div>
      ) : (
        <>
          <ul className={cn("space-y-3", isPlaceholderData && "opacity-60")}>
            {data.orders.map((o) => {
              const status = orderStatus(o.status);
              const [first, ...rest] = o.items;
              return (
                <li key={o.id}>
                  <Link
                    href={ROUTES.account.order(o.id)}
                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:border-brand-200 hover:shadow-level-1 sm:p-5"
                  >
                    <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex">
                      <i className="fa-solid fa-bag-shopping" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {first?.title ?? "Order"}
                        {rest.length > 0 && <span className="font-normal text-gray-500"> + {rest.length} more</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {first && `${productLabel(first.itemType)} • `}
                        {formatOrderDate(o.createdAt)} • {o.orderNumber}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{formatINR(o.amount)}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", status.tone)}>{status.label}</span>
                    </div>
                    <i className="fa-solid fa-chevron-right text-xs text-gray-300" />
                  </Link>
                </li>
              );
            })}
          </ul>

          {pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-gray-500">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pages}
                className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AccountShell>
  );
}
