/**
 * Server-only access to the OG API gateway. Route handlers under app/api use this;
 * client code talks to those handlers (lib/api), never to the gateway directly.
 */

export const GATEWAY_URL = (process.env.OG_API_URL ?? "https://api-staging.occultgurukul.com").replace(/\/$/, "");

/** Client details the gateway bakes into the tokens (API reference §2). */
export const CLIENT_INFO = {
  /** Digits only. */
  appVersion: process.env.OG_APP_VERSION ?? "1",
  deviceType: "web",
  packageName: process.env.OG_PACKAGE_NAME ?? "com.occultgurukul.app",
  locale: "en",
  region: "in",
} as const;

type GatewayInit = Omit<RequestInit, "body"> & { accessToken?: string; json?: unknown; body?: BodyInit | null };

export function gatewayFetch(path: string, { accessToken, json, headers, ...init }: GatewayInit = {}) {
  const h = new Headers(headers);
  if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);
  if (!h.has("xt-request-id")) h.set("xt-request-id", crypto.randomUUID());
  if (json !== undefined) h.set("Content-Type", "application/json");
  return fetch(GATEWAY_URL + path, {
    ...init,
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : init.body,
    cache: "no-store",
  });
}

export type Envelope<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code?: string; details?: Record<string, string> }; data?: unknown };

/** Parses the gateway envelope; infrastructure errors can return non-JSON bodies (§1.2). */
export async function readEnvelope<T>(res: Response): Promise<Envelope<T> | null> {
  try {
    return (await res.json()) as Envelope<T>;
  } catch {
    return null;
  }
}

export function errorResponse(status: number, message: string, code?: string) {
  return Response.json({ success: false, error: { message, ...(code && { code }) } }, { status });
}

/** Passes a gateway response through unchanged (status, JSON body, request id). */
export async function relay(res: Response) {
  const body = await res.text();
  const headers = new Headers({ "Content-Type": res.headers.get("Content-Type") ?? "application/json" });
  const requestId = res.headers.get("xt-request-id");
  if (requestId) headers.set("xt-request-id", requestId);
  return new Response(body, { status: res.status, headers });
}
