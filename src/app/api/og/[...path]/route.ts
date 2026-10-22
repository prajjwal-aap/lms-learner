import type { NextRequest } from "next/server";
import { errorResponse, gatewayFetch, relay } from "@/server/gateway";
import { readSession } from "@/server/session";

/** Gateway areas the learner app may reach. /auth stays behind /api/auth so tokens never reach the browser. */
const ALLOWED_ROOTS = new Set(["users", "catalog", "og-order", "app", "lms", "live", "events"]);

type Ctx = { params: Promise<{ path: string[] }> };

/** Same-origin proxy to the gateway that attaches the access token from the httpOnly cookie. */
async function handler(request: NextRequest, { params }: Ctx) {
  const { path } = await params;
  if (!ALLOWED_ROOTS.has(path[0])) return errorResponse(404, "Not found", "NOT_FOUND");

  const { accessToken, refreshToken } = await readSession();
  // Access cookie expired but the session is alive: let the client refresh first instead of a wasted gateway call.
  if (!accessToken && refreshToken) return errorResponse(401, "Session expired", "TOKEN_EXPIRED");

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const requestId = request.headers.get("xt-request-id");
  if (requestId) headers.set("xt-request-id", requestId);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  try {
    const res = await gatewayFetch(`/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      accessToken,
      body: hasBody ? await request.text() : undefined,
    });
    return relay(res);
  } catch {
    return errorResponse(503, "Can't reach the server. Please try again.");
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
