import { isMocked } from "@/config/features";
import { api, ApiError } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import type { LiveRegistration, SessionPage, SessionTab } from "../types";

const mocked = () => isMocked("live-sessions");
const MIN = 60_000;
const DAY = 86_400_000;

function mockRegistration(id: string, title: string, type: string, startMs: number, opts: Partial<LiveRegistration> = {}): LiveRegistration {
  const opens = startMs - 30 * MIN;
  const closes = startMs + 3 * 60 * MIN;
  const now = Date.now();
  return {
    registration_no: `REG_${id}`,
    status: "CONFIRMED",
    attendee: { name: "Aarav Sharma", is_self: true },
    session: {
      id,
      title,
      scheduled_at: new Date(startMs).toISOString(),
      duration_min: 120,
      timezone: "Asia/Kolkata",
      status: now >= startMs && now < startMs + 120 * MIN ? "LIVE" : now >= startMs ? "ENDED" : "SCHEDULED",
      product: { slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title, type, thumbnail_url: null },
      mentors: [{ slug: "arun-pandit", display_name: "Arun Pandit" }],
    },
    join: { opens_at: new Date(opens).toISOString(), closes_at: new Date(closes).toISOString(), can_join_now: now >= opens && now <= closes },
    replay: { status: now > closes ? "PROCESSING" : "NONE" },
    ...opts,
  };
}

/** Built per call so the join window follows the clock. */
function mockSessions(): LiveRegistration[] {
  const now = Date.now();
  return [
    mockRegistration("sess-live", "Kundli Pathshala Webinar — Live Q&A", "WEBINAR", now - 20 * MIN),
    mockRegistration("sess-soon", "Mega Numerology Masterclass", "MASTERCLASS", now + 25 * 60 * MIN),
    mockRegistration("sess-family", "Palmistry Webinar", "WEBINAR", now + 6 * DAY, { attendee: { name: "Aarav Kumar", is_self: false } }),
    mockRegistration("sess-wait", "KP Astrology Masterclass", "MASTERCLASS", now + 9 * DAY, { status: "WAITLISTED" }),
    mockRegistration("sess-past-1", "Vastu for Homes — Live", "WEBINAR", now - 5 * DAY),
    mockRegistration("sess-past-2", "Lal Kitab Remedies Masterclass", "MASTERCLASS", now - 21 * DAY, { replay: { status: "READY" } }),
  ];
}

/** GET /live/v1/me/sessions?status=upcoming|past (§10.1). */
export async function listMySessions(tab: SessionTab, cursor?: string, limit = 20): Promise<SessionPage> {
  if (mocked()) {
    await mockDelay();
    const items = mockSessions()
      .filter((r) => (tab === "past" ? Date.parse(r.join.closes_at) < Date.now() : Date.parse(r.join.closes_at) >= Date.now()))
      .sort((a, b) => (tab === "past" ? -1 : 1) * (Date.parse(a.session.scheduled_at) - Date.parse(b.session.scheduled_at)));
    return { items, next_cursor: null };
  }
  const data = await api.get<{ items?: unknown[]; next_cursor?: string | null }>("/live/v1/me/sessions", { query: { status: tab, cursor, limit } });
  return { items: (data?.items ?? []).map(normalizeRegistration).filter((r) => r.session.id && r.session.scheduled_at), next_cursor: data?.next_cursor ?? null };
}

/** The live contract (§10) is still being built — fill in missing blocks so the cards never crash. */
function normalizeRegistration(raw: unknown): LiveRegistration {
  const r = (raw ?? {}) as Record<string, Record<string, unknown> | string | undefined>;
  const s = (r.session ?? {}) as Record<string, unknown>;
  const product = (s.product ?? {}) as Record<string, unknown>;
  const join = (r.join ?? {}) as Record<string, unknown>;
  const attendee = (r.attendee ?? {}) as Record<string, unknown>;
  const start = String(s.scheduled_at ?? "");
  const startMs = Date.parse(start);
  const durationMin = typeof s.duration_min === "number" ? s.duration_min : 60;
  return {
    registration_no: String(r.registration_no ?? s.id ?? ""),
    status: (r.status as LiveRegistration["status"]) ?? "CONFIRMED",
    attendee: { name: String(attendee.name ?? ""), is_self: attendee.is_self !== false },
    session: {
      id: String(s.id ?? ""),
      title: String(s.title ?? product.title ?? "Live session"),
      scheduled_at: start,
      duration_min: durationMin,
      timezone: String(s.timezone ?? "Asia/Kolkata"),
      status: (s.status as LiveRegistration["session"]["status"]) ?? "SCHEDULED",
      product: { slug: String(product.slug ?? ""), title: String(product.title ?? s.title ?? ""), type: String(product.type ?? "WEBINAR"), thumbnail_url: (product.thumbnail_url as string) ?? null },
      mentors: Array.isArray(s.mentors) ? (s.mentors as LiveRegistration["session"]["mentors"]).filter((m) => m && m.display_name) : [],
    },
    // Default join window per §10: 30 min before start until 3 h after.
    join: {
      opens_at: String(join.opens_at ?? (Number.isFinite(startMs) ? new Date(startMs - 30 * MIN).toISOString() : start)),
      closes_at: String(join.closes_at ?? (Number.isFinite(startMs) ? new Date(startMs + 3 * 60 * MIN).toISOString() : start)),
      can_join_now: join.can_join_now === true,
    },
    replay: { status: ((r.replay as Record<string, unknown> | undefined)?.status as LiveRegistration["replay"]["status"]) ?? "NONE" },
  };
}

/** POST /live/v1/me/sessions/:id/join (§10.2) → Zoom URL. NOT_OPEN_YET / JOIN_CLOSED / SESSION_CANCELLED as ApiError codes. */
export async function joinSession(sessionId: string): Promise<string> {
  if (mocked()) {
    await mockDelay(200);
    const reg = mockSessions().find((r) => r.session.id === sessionId);
    if (!reg?.join.can_join_now) throw new ApiError(403, "Joining opens 30 minutes before the start", "NOT_OPEN_YET", undefined, { opens_at: reg?.join.opens_at });
    return "https://zoom.us/test";
  }
  const { join_url } = await api.post<{ join_url: string }>(`/live/v1/me/sessions/${encodeURIComponent(sessionId)}/join`);
  return join_url;
}

/** POST /live/v1/sessions/:id/register-free (§10.3). Beneficiary omitted = SELF. Safe to call twice. */
export async function registerFree(sessionId: string): Promise<{ registration_no: string; status: string }> {
  if (mocked()) {
    await mockDelay(300);
    return { registration_no: `REG_${sessionId}`, status: "CONFIRMED" };
  }
  return api.post(`/live/v1/sessions/${encodeURIComponent(sessionId)}/register-free`, {});
}
