"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from "../api/notifications.queries";
import type { DeepLink, InboxItem, NotificationCategory } from "../types";

const TABS: { label: string; category?: NotificationCategory }[] = [
  { label: "All" },
  { label: "Announcements", category: "ANNOUNCEMENT" },
  { label: "Learning", category: "LEARNING" },
  { label: "Live", category: "LIVE" },
  { label: "Offers", category: "OFFER" },
];

/** In-app target of a deep link (§15.3); null = nothing to open. */
function deepLinkHref(link: DeepLink): string | null {
  switch (link.type) {
    case "HOME":
      return ROUTES.home;
    case "LIBRARY":
      return ROUTES.courses;
    case "COURSE":
      return link.id ? ROUTES.course(link.id) : ROUTES.courses;
    case "LESSON":
      return link.id && link.course_id ? ROUTES.lesson(link.course_id, link.id) : link.course_id ? ROUTES.course(link.course_id) : ROUTES.courses;
    case "PRODUCT":
      // Product pages are addressed by slug and the link only carries the product id.
      return ROUTES.store;
    case "LIVE_SESSION":
      return ROUTES.liveSessions;
    case "URL":
      return link.url;
    default:
      return null;
  }
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string) {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "";
  const min = Math.round((ms - Date.now()) / 60_000);
  if (min > -1) return "Just now";
  if (min > -60) return relative.format(min, "minute");
  if (min > -60 * 24) return relative.format(Math.round(min / 60), "hour");
  if (min > -60 * 24 * 7) return relative.format(Math.round(min / (60 * 24)), "day");
  return new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Header bell with unread badge; opens the inbox (§15.6) with category tabs. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unread = 0 } = useUnreadCount();

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
      >
        <Bell className="size-[17px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && <InboxPanel onClose={() => setOpen(false)} />}
    </div>
  );
}

function InboxPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const category = TABS[tab].category;
  const list = useNotifications(category, true);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const router = useRouter();
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const hasUnread = items.some((n) => !n.read);

  function openItem(item: InboxItem) {
    if (!item.read) markRead.mutate(item.id);
    const href = deepLinkHref(item.deep_link);
    if (!href) return;
    onClose();
    if (/^https?:\/\//.test(href)) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  }

  return (
    <>
      {/* Click-away layer */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Notifications"
        className="fixed inset-x-4 top-16 z-50 flex max-h-[min(560px,calc(100dvh-10rem))] flex-col md:max-h-[min(560px,calc(100vh-5rem))] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-level-3 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96"
      >
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
          <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
          <button
            type="button"
            onClick={() => markAll.mutate(category)}
            disabled={!hasUnread || markAll.isPending}
            className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:cursor-default disabled:text-gray-300"
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
          </button>
        </div>

        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-gray-100 px-4 pb-2.5">
          {TABS.map((t, i) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setTab(i)}
              aria-pressed={tab === i}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                tab === i ? "bg-brand-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {list.isPending ? (
            <p className="px-4 py-10 text-center text-sm text-gray-500">Loading…</p>
          ) : list.isError ? (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              Couldn&apos;t load notifications.{" "}
              <button type="button" onClick={() => list.refetch()} className="font-semibold text-brand-700 hover:underline">
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <Bell className="mb-2 size-6 text-gray-300" />
              <p className="text-sm text-gray-500">You&apos;re all caught up.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={cn("flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50", !n.read && "bg-brand-50/60")}
                  >
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand-600")} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm text-gray-900", !n.read && "font-semibold")}>{n.title}</span>
                      {n.body && <span className="mt-0.5 line-clamp-2 block text-xs text-gray-600">{n.body}</span>}
                      <span className="mt-1 block text-[11px] text-gray-400">
                        {timeAgo(n.created_at)}
                        {!n.read && <span className="sr-only"> · unread</span>}
                      </span>
                    </span>
                    {n.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element -- campaign images come from the admin portal's CDN, not in next/image config
                      <img src={n.image_url} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {list.hasNextPage && (
            <button
              type="button"
              onClick={() => list.fetchNextPage()}
              disabled={list.isFetchingNextPage}
              className="w-full border-t border-gray-100 py-2.5 text-xs font-semibold text-brand-700 hover:bg-gray-50 disabled:text-gray-400"
            >
              {list.isFetchingNextPage ? "Loading…" : "Load older"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
