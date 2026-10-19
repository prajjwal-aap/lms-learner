/**
 * Fire-and-forget analytics (POST /events/v1/track, §11). One event per request, never retried,
 * never blocks the UI. Never put phone numbers, emails or names in `params`.
 */
export type AnalyticsEvent =
  | "page_view"
  | "view_item"
  | "view_item_list"
  | "view_search_results"
  | "select_item"
  | "add_to_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "video_start"
  | "video_progress"
  | "video_complete"
  | "file_download"
  | "click";

/** GA4-style item for commerce events. */
export type AnalyticsItem = { item_id: string; item_name: string; item_category: string; price: number; quantity: number };

const ANON_KEY = "og-anonymous-id";
const SESSION_KEY = "og-analytics-session";

function stored(storage: Storage, key: string) {
  let id = storage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    storage.setItem(key, id);
  }
  return id;
}

export function track(event: AnalyticsEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || process.env.NEXT_PUBLIC_MOCK_FEATURES?.includes("all")) return;
  try {
    const body = {
      event_type: event,
      anonymous_id: stored(localStorage, ANON_KEY),
      session_id: stored(sessionStorage, SESSION_KEY),
      source: "web",
      business_name: "og",
      brand: "occultgurukul",
      page_url: window.location.pathname,
      referrer: document.referrer || undefined,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      event_params: params,
    };
    // keepalive lets the event survive a navigation; failures are ignored on purpose.
    void fetch("/api/og/events/v1/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Storage blocked — skip the event.
  }
}

/** `{currency, value, items}` for view_item / add_to_cart / begin_checkout. */
export const commerceParams = (items: AnalyticsItem[]) => ({
  currency: "INR",
  value: items.reduce((n, i) => n + i.price * i.quantity, 0),
  items,
});
