import { isMocked } from "@/config/features";
import { api } from "@/lib/api";
import { mockDelay } from "@/lib/mockApi";
import type { DeepLink, InboxItem, InboxPage, NotificationCategory } from "../types";

const mocked = () => isMocked("notifications");
const HOUR = 3_600_000;

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const link = (type: DeepLink["type"], id: string | null = null): DeepLink => ({ type, id, course_id: null, url: null });

const mockInbox: InboxItem[] = [
  { id: "n1", category: "LIVE", title: "Your masterclass starts in 1 hour", body: "Mega Numerology Masterclass — join from Live Sessions.", image_url: null, deep_link: link("LIVE_SESSION", "sess-soon"), read: false, created_at: ago(0.2 * HOUR) },
  { id: "n2", category: "OFFER", title: "Diwali offer 🪔", body: "40% off all courses this week.", image_url: null, deep_link: link("NONE"), read: false, created_at: ago(5 * HOUR) },
  { id: "n3", category: "LEARNING", title: "Keep your streak going", body: "You're 3 lessons away from finishing Kundli Mastery.", image_url: null, deep_link: link("LIBRARY"), read: false, created_at: ago(26 * HOUR) },
  { id: "n4", category: "ANNOUNCEMENT", title: "New: certificates are here", body: "Finish a course to download your certificate.", image_url: null, deep_link: link("NONE"), read: true, created_at: ago(72 * HOUR) },
];

const unread = () => mockInbox.filter((n) => !n.read).length;

/** GET /app/v1/notifications (§15.6) — newest first; `category` omitted = All. */
export async function listNotifications(category?: NotificationCategory, cursor?: string, limit = 20): Promise<InboxPage> {
  if (mocked()) {
    await mockDelay();
    return { items: mockInbox.filter((n) => !category || n.category === category).map((n) => ({ ...n })), next_cursor: null, unread_count: unread() };
  }
  const data = await api.get<Partial<InboxPage>>("/app/v1/notifications", { query: { category, cursor, limit } });
  return { items: (data?.items ?? []).map(normalizeItem), next_cursor: data?.next_cursor ?? null, unread_count: data?.unread_count ?? 0 };
}

function normalizeItem(raw: Partial<InboxItem>): InboxItem {
  return {
    id: String(raw.id ?? ""),
    category: raw.category ?? "ANNOUNCEMENT",
    title: raw.title ?? "",
    body: raw.body ?? "",
    image_url: raw.image_url ?? null,
    deep_link: { type: "NONE", id: null, course_id: null, url: null, ...raw.deep_link },
    read: raw.read === true,
    created_at: raw.created_at ?? "",
  };
}

/** GET /app/v1/notifications/unread-count — the bell badge. */
export async function getUnreadCount(): Promise<number> {
  if (mocked()) {
    await mockDelay();
    return unread();
  }
  const data = await api.get<{ unread_count?: number }>("/app/v1/notifications/unread-count");
  return data?.unread_count ?? 0;
}

/** POST /app/v1/notifications/:id/read → the new unread count. */
export async function markRead(id: string): Promise<number> {
  if (mocked()) {
    await mockDelay();
    const item = mockInbox.find((n) => n.id === id);
    if (item) item.read = true;
    return unread();
  }
  const data = await api.post<{ unread_count?: number }>(`/app/v1/notifications/${encodeURIComponent(id)}/read`);
  return data?.unread_count ?? 0;
}

/** POST /app/v1/notifications/read-all — one tab (`category`) or everything. Returns the new unread count. */
export async function markAllRead(category?: NotificationCategory): Promise<number> {
  if (mocked()) {
    await mockDelay();
    for (const n of mockInbox) if (!category || n.category === category) n.read = true;
    return unread();
  }
  const data = await api.post<{ unread_count?: number }>("/app/v1/notifications/read-all", category ? { category } : {});
  return data?.unread_count ?? 0;
}
