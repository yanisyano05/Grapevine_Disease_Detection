import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-API-Version": "1.0",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    await auth.api.signOut({ headers: request.headers });
  } catch {
    // best-effort: even if revocation fails the mobile clears its token
  }
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
