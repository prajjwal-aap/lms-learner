import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/config/cookies";
import { ROUTES } from "@/config/routes";

const PUBLIC_PATHS = [ROUTES.login, ROUTES.resetPassword];

/** Gate every learner page behind a session; bounce signed-in users away from auth pages. */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasSession && !isPublic) {
    const url = new URL(ROUTES.login, request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (hasSession && pathname.startsWith(ROUTES.login)) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // /api handles its own auth (route handlers answer 401 instead of redirecting).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
