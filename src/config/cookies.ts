/** Cookie names shared by proxy.ts, the /api route handlers and the auth feature. */

/** Gateway refresh token (httpOnly, 30 days). Its presence means "signed in". */
export const SESSION_COOKIE = "og_rt";
/** Gateway access token (httpOnly, expires with the JWT, ~15 min). */
export const ACCESS_COOKIE = "og_at";
/** Per-browser device id baked into the tokens (readable: playback/ebook APIs need it in the body). */
export const DEVICE_COOKIE = "og_did";
/** Set once the learner has finished or skipped onboarding. */
export const ONBOARDED_COOKIE = "og_onboarded";
