"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { cn, formatINR } from "@/lib/utils";
import { useOrder, useOrderDeliverables } from "../api/account.queries";
import { formatOrderDate, orderStatus, productLabel } from "../lib/format";
import type { Deliverable } from "../types";
import { AccountShell, AccountStatus, accountCard } from "./AccountShell";

/** One order (GET /og-order/:id) with what was delivered (GET /og-order/:id/product-details). */
export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: deliverables } = useOrderDeliverables(orderId);
  const back = { backHref: ROUTES.account.purchases, backLabel: "Purchase history" };

  if (!order) {
    return (
      <AccountShell title="Order details" {...back}>
        <AccountStatus loading={isLoading} error={error} />
      </AccountShell>
    );
  }

  const status = orderStatus(order.status);
  const itemsTotal = order.items.reduce((n, i) => n + i.amount, 0);

  return (
    <AccountShell title="Order details" subtitle={`${order.orderNumber} • ${formatOrderDate(order.createdAt)}`} {...back}>
      <section className={accountCard}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Items</h2>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", status.tone)}>{status.label}</span>
        </div>
        <ul className="mt-4 divide-y divide-gray-100">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{i.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{productLabel(i.itemType)}</p>
              </div>
              <span className="shrink-0 text-sm text-gray-700">{formatINR(i.amount)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-2 border-t border-gray-100 pt-4 text-sm">
          {order.discountAmount > 0 && (
            <>
              <div className="flex justify-between text-gray-600">
                <dt>Items total</dt>
                <dd>{formatINR(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between text-emerald-700">
                <dt>Discount{order.couponCode && ` (${order.couponCode})`}</dt>
                <dd>− {formatINR(order.discountAmount)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900">
            <dt>{order.status === "FAILED" ? "Amount" : "Amount paid"}</dt>
            <dd>{formatINR(order.amount)}</dd>
          </div>
        </dl>
        {order.paymentId && <p className="mt-3 text-xs text-gray-400">Payment ID: {order.paymentId}</p>}
        {order.status === "FAILED" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
            This payment didn&apos;t go through and you weren&apos;t charged. If money left your account, it is refunded automatically by your bank.
          </p>
        )}
      </section>

      {deliverables && deliverables.length > 0 && (
        <section className={`${accountCard} mt-5`}>
          <h2 className="text-base font-semibold text-gray-900">Your access</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {deliverables.map((d) => (
              <DeliverableRow key={d.id} item={d} />
            ))}
          </ul>
        </section>
      )}
    </AccountShell>
  );
}

const linkClass = "inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100";

function DeliverableRow({ item: d }: { item: Deliverable }) {
  const isCourse = d.productType === "COURSE" || d.productType === "SELF_PLACED" || d.productType === "BUNDLE";
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{d.title}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {productLabel(d.productType)}
          {d.classDate && ` • ${d.classDate.slice(0, 16)} IST`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {d.downloadUrl && (
          <a href={d.downloadUrl} target="_blank" rel="noreferrer" className={linkClass}>
            <i className="fa-solid fa-download" />
            Download
          </a>
        )}
        {d.replayUrl && (
          <a href={d.replayUrl} target="_blank" rel="noreferrer" className={linkClass}>
            <i className="fa-solid fa-play" />
            Watch replay
          </a>
        )}
        {d.workbookUrl && (
          <a href={d.workbookUrl} target="_blank" rel="noreferrer" className={linkClass}>
            <i className="fa-solid fa-file-lines" />
            Workbook
          </a>
        )}
        {isCourse && (
          <Link href={ROUTES.courses} className={linkClass}>
            <i className="fa-solid fa-book-open" />
            Open in My Learnings
          </Link>
        )}
      </div>
    </li>
  );
}
