import { updateSession } from "@/lib/supabase/middleware";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { NextResponse, type NextRequest } from "next/server";

// Auth routes that need rate limiting
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit auth routes
  if (AUTH_ROUTES.includes(pathname)) {
    const ip = getClientIp(request.headers);
    const rateLimitKey = `auth:${ip}:${pathname}`;

    // Use stricter limits for password reset
    const config =
      pathname === "/forgot-password"
        ? RATE_LIMITS.passwordReset
        : pathname === "/signup"
          ? RATE_LIMITS.signup
          : RATE_LIMITS.auth;

    const result = checkRateLimit(rateLimitKey, config);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(result.retryAfter),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.retryAfter),
          },
        }
      );
    }
  }

  const { user, supabaseResponse } = await updateSession(request);

  // Protected routes - require authentication
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  if (
    ["/login", "/signup", "/forgot-password"].includes(request.nextUrl.pathname)
  ) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - Static assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
