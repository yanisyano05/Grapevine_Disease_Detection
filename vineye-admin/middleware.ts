import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/diseases") ||
    pathname.startsWith("/guides") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/alerts")
  ) {
    const sessionCookie = request.cookies.get("better-auth.session_token");
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/diseases/:path*",
    "/guides/:path*",
    "/users/:path*",
    "/alerts/:path*",
  ],
};
