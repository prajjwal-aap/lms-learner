import { CLIENT_INFO, errorResponse, gatewayFetch, readEnvelope } from "@/server/gateway";
import { clearSession, readSession, saveTokens } from "@/server/session";

/** Rotates the token pair (§2.5). The browser calls this once on a 401, then retries its request. */
export async function POST() {
  const { refreshToken, deviceId } = await readSession();
  if (!refreshToken || !deviceId) {
    await clearSession();
    return errorResponse(401, "Please log in again", "SESSION_EXPIRED");
  }

  let res: Response;
  try {
    res = await gatewayFetch("/auth/token/refresh", {
      method: "POST",
      json: { refreshToken, deviceId, deviceType: CLIENT_INFO.deviceType, appVersion: CLIENT_INFO.appVersion },
    });
  } catch {
    return errorResponse(503, "Can't reach the server. Please try again.");
  }

  const body = await readEnvelope<{ accessToken: string; refreshToken: string }>(res);
  if (res.ok && body?.success) {
    await saveTokens(body.data);
    return Response.json({ success: true, data: {} });
  }
  // 4xx = bad/expired refresh token; 500 = "User is disabled" (§2.5). Gateway outages (502/503) keep the session.
  if (res.status <= 500) {
    await clearSession();
    return errorResponse(401, "Please log in again", "SESSION_EXPIRED");
  }
  return errorResponse(503, "Can't reach the server. Please try again.");
}
