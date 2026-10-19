import type { LiveRegistration } from "./types";

const IST = "Asia/Kolkata";
const monthFmt = new Intl.DateTimeFormat("en-US", { timeZone: IST, month: "short" });
const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: IST, day: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: IST, hour: "2-digit", minute: "2-digit", hour12: true });
const dateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "short", day: "numeric", month: "short" });

type WithStart = { session: { scheduled_at: string } };

/** Pieces for the date badge, e.g. { month: "OCT", day: "28" }. */
export const sessionBadge = (r: WithStart) => {
  const d = new Date(r.session.scheduled_at);
  return { month: monthFmt.format(d).toUpperCase(), day: dayFmt.format(d) };
};

/** "07:30 PM IST" */
export const sessionTime = (r: WithStart) => `${timeFmt.format(new Date(r.session.scheduled_at))} IST`;

/** "Wed, 28 Oct • 07:30 PM IST" */
export const sessionWhen = (r: WithStart) => `${dateFmt.format(new Date(r.session.scheduled_at))} • ${sessionTime(r)}`;

const gcalStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, "");

/** Google Calendar "add event" link for a session. */
export function calendarUrl(r: LiveRegistration) {
  const start = Date.parse(r.session.scheduled_at);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: r.session.title,
    dates: `${gcalStamp(start)}/${gcalStamp(start + r.session.duration_min * 60_000)}`,
    details: `${r.session.product.title} • Occult Gurukul live class. Join from the Live Sessions page.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** "2h 14m" / "14m 05s" until a timestamp. */
export function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : h > 0 ? `${h}h ${m}m` : `${m}m ${String(s % 60).padStart(2, "0")}s`;
}
