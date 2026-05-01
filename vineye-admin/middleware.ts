import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Version",
  "X-API-Version": "1.0",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Mobile API routes: public, CORS enabled ──
  if (pathname.startsWith("/api/mobile")) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const response = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // ── Admin routes: require session ──
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/diseases") ||
    pathname.startsWith("/guides") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/alerts")
  ) {
    // better-auth posts the cookie as `better-auth.session_token` over HTTP
    // and `__Secure-better-auth.session_token` over HTTPS. Their helper
    // resolves both variants for us.
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/mobile/:path*",
    "/dashboard/:path*",
    "/diseases/:path*",
    "/guides/:path*",
    "/users/:path*",
    "/alerts/:path*",
  ],
};
