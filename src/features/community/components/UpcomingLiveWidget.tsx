"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { sessionBadge, sessionWhen, useUpcomingSessions } from "@/features/live-sessions";

/** "Upcoming live sessions" card; shows the design's empty state when nothing is scheduled. */
export function UpcomingLiveWidget() {
  const { data: sessions, isPending } = useUpcomingSessions(2);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Upcoming live sessions</h3>
        <Link className="text-xs font-medium text-blue-600 hover:underline" href={ROUTES.liveSessions}>
          See all
        </Link>
      </div>

      {isPending ? (
        <div className="h-16 animate-pulse rounded-lg bg-gray-100" aria-busy="true" />
      ) : !sessions?.length ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-400">
            <i className="fa-regular fa-clock text-lg" />
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-gray-500">
            Your scheduled sessions will appear here. Add them to your calendar and join when the button appears.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sessions.map((r) => {
            const { month, day } = sessionBadge(r);
            return (
              <li key={r.registration_no} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
                  <span className="text-[9px] uppercase text-purple-600">{month}</span>
                  <span className="text-sm leading-tight">{day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-900">{r.session.title}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">{sessionWhen(r)}</p>
                </div>
                {r.join.can_join_now ? (
                  <Link
                    href={ROUTES.liveSessions}
                    className="flex shrink-0 items-center gap-1 rounded-md bg-purple-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-purple-800"
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                    Join
                  </Link>
                ) : (
                  <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-purple-700">
                    {r.session.product.type.toLowerCase()}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
