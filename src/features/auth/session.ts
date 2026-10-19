import { ONBOARDED_COOKIE, SESSION_COOKIE } from "@/config/cookies";

const setCookie = (name: string, value: string, days = 30) => {
  document.cookie = `${name}=${value}; path=/; max-age=${days * 86400}; samesite=lax`;
};

/**
 * Client-side session flags. With the real API the session cookies are httpOnly and set by
 * /api/auth/*; `startMock` / `endMock` only exist so mock auth can get past proxy.ts.
 */
export const session = {
  startMock: () => setCookie(SESSION_COOKIE, "mock"),
  endMock: () => {
    setCookie(SESSION_COOKIE, "", 0);
    setCookie(ONBOARDED_COOKIE, "", 0);
  },
  markOnboarded: () => setCookie(ONBOARDED_COOKIE, "1", 365),
  isOnboarded: () => document.cookie.includes(`${ONBOARDED_COOKIE}=1`),
};
