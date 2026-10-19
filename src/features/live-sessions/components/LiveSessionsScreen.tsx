"use client";

import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useMySessions } from "../api/live-sessions.queries";
import type { SessionTab } from "../types";
import { SessionCard } from "./SessionCard";

const TABS: { id: SessionTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

function EmptyState({ tab }: { tab: SessionTab }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-4 text-slate-700 opacity-90">
        <svg className="mx-auto h-14 w-14 stroke-current" fill="none" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h7a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
          <circle className="fill-white stroke-current" cx="17.5" cy="17.5" r="4.5" strokeWidth={1.8} />
          <path d="M17.5 15.5v2l1.2 1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-800">{tab === "upcoming" ? "You aren't registered for any upcoming live sessions." : "No past live sessions yet."}</p>
      {tab === "upcoming" && (
        <Link href={ROUTES.masterclasses} className="mt-3 text-sm font-semibold text-purple-700 hover:underline">
          Browse masterclasses & webinars
        </Link>
      )}
    </div>
  );
}

/** Live Sessions: the learner's webinar / masterclass registrations (GET /live/v1/me/sessions). */
export function LiveSessionsScreen() {
  const [tab, setTab] = useState<SessionTab>("upcoming");
  const sessions = useMySessions(tab);
  const items = sessions.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f8fb] text-slate-800">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-xs">
          <div className="px-7 pb-0 pt-6">
            <h1 className="mb-4 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Live Sessions</h1>
            <div role="tablist" className="flex items-center gap-8 border-b border-gray-200 text-sm font-semibold">
              {TABS.map((t) => {
                const active = t.id === tab;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={cn("relative pb-3 transition-colors", active ? "font-semibold text-purple-700" : "text-gray-600 hover:text-gray-900")}
                  >
                    {t.label}
                    {active && <span className="absolute -bottom-px left-0 right-0 h-[2.5px] bg-[#7b1fa2]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6">
            {sessions.isPending ? (
              <div className="space-y-4 px-7 pb-10" aria-busy="true">
                {[0, 1].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : sessions.isError ? (
              <p className="px-7 pb-10 text-sm text-red-600">Could not load live sessions. Please try again.</p>
            ) : items.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <div className={cn("space-y-4 px-7 pb-10", sessions.isPlaceholderData && "opacity-60")}>
                {items.map((r) => (
                  <SessionCard key={r.registration_no} registration={r} />
                ))}
                {sessions.hasNextPage && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => sessions.fetchNextPage()}
                      disabled={sessions.isFetchingNextPage}
                      className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {sessions.isFetchingNextPage ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
