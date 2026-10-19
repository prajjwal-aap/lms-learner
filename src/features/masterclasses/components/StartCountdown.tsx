"use client";

import { useNow } from "@/lib/useNow";

const DAY_MS = 24 * 60 * 60 * 1000;
const LIVE_WINDOW_MS = 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, "0");

/** Ticking "Starts in" chip for classes within the next 24h. Renders nothing until mounted (no hydration mismatch). */
export function StartCountdown({ startsAt }: { startsAt: string }) {
  const now = useNow();
  if (now === null) return null;

  const diff = new Date(startsAt).getTime() - now;
  if (diff <= -LIVE_WINDOW_MS || diff > DAY_MS) return null;

  if (diff <= 0) {
    return (
      <div className="absolute top-2.5 left-2.5 bg-red-600 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Live now
      </div>
    );
  }

  const s = Math.floor(diff / 1000);
  return (
    <div
      className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums"
      aria-live="off"
    >
      Starts in {pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
    </div>
  );
}
