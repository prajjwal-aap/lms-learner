"use client";

import { useMutation } from "@tanstack/react-query";
import { Users, Video } from "lucide-react";
import { isApiError } from "@/lib/api";
import { openInNewTab } from "@/lib/openInNewTab";
import { useNow } from "@/lib/useNow";
import { cn } from "@/lib/utils";
import { joinSession } from "../api/live-sessions.api";
import { calendarUrl, countdown, sessionBadge, sessionTime } from "../format";
import type { LiveRegistration } from "../types";

const primaryBtn =
  "flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-purple-700";
const secondaryBtn = "rounded-lg border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-700 transition-colors hover:bg-white";

const JOIN_ERRORS: Record<string, string> = {
  NOT_OPEN_YET: "Joining opens 30 minutes before the start.",
  JOIN_CLOSED: "This session is over.",
  NOT_REGISTERED: "You're not registered for this session.",
  SESSION_CANCELLED: "This session was cancelled.",
  PROVIDER_UNAVAILABLE: "Zoom is unavailable right now. Try again in a minute.",
};

/** One registration row: date badge, details, countdown and Join (enabled inside the join window). */
export function SessionCard({ registration: r }: { registration: LiveRegistration }) {
  const now = useNow();
  const { month, day } = sessionBadge(r);
  const s = r.session;
  const opensAt = Date.parse(r.join.opens_at);
  const closesAt = Date.parse(r.join.closes_at);
  const past = now !== null ? now > closesAt : s.status === "ENDED";
  // The server's flag is refreshed every minute; the clock keeps the button honest in between.
  const canJoin = r.status === "CONFIRMED" && s.status !== "CANCELLED" && (now !== null ? now >= opensAt && now <= closesAt : r.join.can_join_now);
  const live = s.status === "LIVE" || (now !== null && now >= Date.parse(s.scheduled_at) && now <= closesAt);
  // The tab is opened inside the click (popup blockers); the Zoom URL arrives from the join call.
  const join = useMutation({ mutationFn: (opening: Promise<void>) => opening });
  const joinError = join.error ? ((isApiError(join.error) && join.error.code && JOIN_ERRORS[join.error.code]) || join.error.message) : null;

  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-4 rounded-xl border p-5 md:flex-row md:items-center",
        past || s.status === "CANCELLED" ? "border-gray-200 bg-white" : "border-purple-100 bg-purple-50/40",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-bold",
            past ? "bg-gray-100 text-gray-600" : "bg-purple-100 text-purple-700",
          )}
        >
          <span className={cn("text-[10px] uppercase", past ? "text-gray-500" : "text-purple-600")}>{month}</span>
          <span className="text-base leading-tight">{day}</span>
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-purple-800">{s.product.type.toLowerCase()}</span>
            <span className="text-xs text-gray-500">Zoom</span>
            {live && !past && (
              <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
                LIVE NOW
              </span>
            )}
            {r.status === "WAITLISTED" && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Waitlisted</span>}
            {s.status === "CANCELLED" && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">Cancelled</span>}
          </div>
          <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {past ? "Held at" : "Starts at"} {sessionTime(r)} • {s.duration_min} mins
            {s.mentors.length > 0 && ` • ${s.mentors.map((m) => m.display_name).join(", ")}`}
          </p>
          {!r.attendee.is_self && (
            <p className="mt-1 text-xs font-medium text-purple-700">
              <Users className="mr-1.5 inline-block size-3 align-[-0.125em]" />
              Attendee: {r.attendee.name}
            </p>
          )}
          <p className="mt-1 text-[11px] text-gray-400">Registration {r.registration_no}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 self-end md:self-center">
        <div className="flex items-center gap-3">
          {past ? (
            <span className="text-xs font-medium text-gray-400">
              {r.replay.status === "READY" ? "Replay available in My Learnings" : r.replay.status === "PROCESSING" ? "Replay is processing" : "No replay"}
            </span>
          ) : (
            s.status !== "CANCELLED" && (
              <>
                <a href={calendarUrl(r)} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                  Add to Calendar
                </a>
                <button
                  type="button"
                  disabled={!canJoin || join.isPending}
                  onClick={() => join.mutate(openInNewTab(() => joinSession(s.id)))}
                  title={canJoin ? undefined : "Join opens 30 minutes before the start"}
                  className={primaryBtn}
                >
                  <Video className="size-[11px] shrink-0" />
                  {join.isPending ? "Opening…" : "Join Room"}
                </button>
              </>
            )
          )}
        </div>
        {!past && !canJoin && now !== null && now < opensAt && r.status === "CONFIRMED" && (
          <span className="text-[11px] font-medium tabular-nums text-gray-500">Join opens in {countdown(opensAt - now)}</span>
        )}
        {joinError && <span className="text-[11px] text-red-600">{joinError}</span>}
      </div>
    </div>
  );
}
