import { cookies } from "next/headers";
import { ACCESS_COOKIE, DEVICE_COOKIE, ONBOARDED_COOKIE, SESSION_COOKIE } from "@/config/cookies";

const BASE = { path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" } as const;
const DAY = 86_400;

/** Seconds until a JWT's `exp`, or null when it can't be read. */
function secondsUntilExpiry(jwt: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? payload.exp - Math.floor(Date.now() / 1000) : null;
  } catch {
    return null;
  }
}

export async function readSession() {
  const jar = await cookies();
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value,
    refreshToken: jar.get(SESSION_COOKIE)?.value,
    deviceId: jar.get(DEVICE_COOKIE)?.value,
  };
}

/** The tokens are bound to this id, so it must stay stable for the browser (§2 "deviceId once per install"). */
export async function getOrCreateDeviceId() {
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  jar.set(DEVICE_COOKIE, id, { ...BASE, maxAge: 365 * DAY });
  return id;
}

export async function saveTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
  const jar = await cookies();
  // Drop the access cookie 30 s before the JWT expires so the client refreshes before the gateway rejects it.
  const accessTtl = (secondsUntilExpiry(accessToken) ?? 15 * 60) - 30;
  jar.set(ACCESS_COOKIE, accessToken, { ...BASE, httpOnly: true, maxAge: Math.max(accessTtl, 1) });
  jar.set(SESSION_COOKIE, refreshToken, { ...BASE, httpOnly: true, maxAge: secondsUntilExpiry(refreshToken) ?? 30 * DAY });
}

export async function clearSession() {
  const jar = await cookies();
  for (const name of [ACCESS_COOKIE, SESSION_COOKIE, ONBOARDED_COOKIE]) jar.delete(name);
}
