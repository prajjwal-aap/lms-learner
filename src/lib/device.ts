import { DEVICE_COOKIE } from "@/config/cookies";

const FALLBACK_KEY = "og-device-id";

/**
 * Per-browser device id the LMS uses for device limits (playback, ebooks). Reads the id baked
 * into the session tokens at login; falls back to a stored random id (mock auth / old sessions).
 */
export function getDeviceId(): string {
  const fromCookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${DEVICE_COOKIE}=`))
    ?.slice(DEVICE_COOKIE.length + 1);
  if (fromCookie) return decodeURIComponent(fromCookie);
  try {
    let id = localStorage.getItem(FALLBACK_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(FALLBACK_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
