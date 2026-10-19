import { ROUTES } from "@/config/routes";
import { ApiError, GENERIC_ERROR } from "./errors";

type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;
type Options = { query?: Query; signal?: AbortSignal };

/** Unwraps `{ success, data }`; throws ApiError with a user-safe message (server text for 4xx only, §1.2). */
async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (res.ok && body?.success !== false) return body?.data as T;
  const err = body?.error ?? {};
  const message = res.status < 500 && err.message ? err.message : GENERIC_ERROR;
  throw new ApiError(res.status, message, err.code, err.details, body?.data);
}

function toQueryString(query?: Query) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  const s = params.toString();
  return s ? `?${s}` : "";
}

let refreshing: Promise<boolean> | null = null;

/** One refresh at a time: the gateway rotates refresh tokens, so parallel 401s must share a single call (§2.5). */
function refreshSession() {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname.startsWith(ROUTES.login)) return;
  // Full reload on purpose: runs outside React and drops every cached query of the dead session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${ROUTES.login}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
}

async function send<T>(method: string, path: string, body: unknown, opts: Options = {}, retried = false): Promise<T> {
  const res = await fetch(`/api/og${path}${toQueryString(opts.query)}`, {
    method,
    headers: { "xt-request-id": crypto.randomUUID(), ...(body !== undefined && { "Content-Type": "application/json" }) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: opts.signal,
  });
  if (res.status === 401 && !retried) {
    if (await refreshSession()) return send<T>(method, path, body, opts, true);
    redirectToLogin();
  }
  return unwrap<T>(res);
}

/** Gateway client for the browser. Paths are gateway paths, e.g. `api.get("/lms/v1/me/library")`. */
export const api = {
  get: <T>(path: string, opts?: Options) => send<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: Options) => send<T>("POST", path, body ?? {}, opts),
  put: <T>(path: string, body: unknown, opts?: Options) => send<T>("PUT", path, body, opts),
  patch: <T>(path: string, body: unknown, opts?: Options) => send<T>("PATCH", path, body, opts),
  delete: <T>(path: string, opts?: Options) => send<T>("DELETE", path, undefined, opts),
};

/** Calls our own /api/auth/* handlers (login, logout). No refresh-on-401: a 401 there means a wrong OTP. */
export async function authRequest<T>(action: "otp" | "verify" | "logout", body: unknown = {}): Promise<T> {
  const res = await fetch(`/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return unwrap<T>(res);
}
