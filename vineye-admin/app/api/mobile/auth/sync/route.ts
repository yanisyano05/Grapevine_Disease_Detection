import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mobileAuthSyncSchema } from "@/lib/validations";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-API-Version": "1.0",
};

const PASSWORD_PEPPER =
  process.env.MOBILE_AUTH_PEPPER ||
  process.env.BETTER_AUTH_SECRET ||
  "vineye-mobile-pepper-v1";

function derivePassword(email: string, deviceId: string | null | undefined) {
  // Deterministic per email+deviceId+pepper. The password never leaves the
  // server. If deviceId is missing we fall back to the email so that the
  // same user can re-login on the same email even without a stable id.
  const seed = `${email}::${deviceId || "no-device"}::${PASSWORD_PEPPER}`;
  return createHash("sha256").update(seed).digest("hex").slice(0, 60);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = mobileAuthSyncSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const { name, email, deviceId } = parsed.data;
  const password = derivePassword(email, deviceId);

  // Try sign-in first. If the user does not exist (or password mismatch
  // because the deviceId changed) we fall through to sign-up.
  let token: string | null = null;
  let userId: string | null = null;

  try {
    const res = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    if (res.ok) {
      token = res.headers.get("set-auth-token");
      const data = (await res.json()) as { user?: { id?: string } };
      userId = data.user?.id ?? null;
    }
  } catch (err) {
    // Most likely INVALID_PASSWORD or USER_NOT_FOUND — let sign-up handle.
    if (!(err instanceof APIError)) {
      console.error("[mobile/auth/sync] signIn unexpected error:", err);
    }
  }

  if (!token) {
    try {
      const res = await auth.api.signUpEmail({
        body: { name, email, password },
        asResponse: true,
      });
      if (res.ok) {
        token = res.headers.get("set-auth-token");
        const data = (await res.json()) as { user?: { id?: string } };
        userId = data.user?.id ?? null;
      } else {
        // 422 USER_ALREADY_EXISTS on a different password = deviceId changed.
        return Response.json(
          {
            error:
              "Account exists on another device. Reset the app or use the same device.",
          },
          { status: 409, headers: CORS_HEADERS },
        );
      }
    } catch (err) {
      console.error("[mobile/auth/sync] signUp failed:", err);
      return Response.json(
        { error: "Could not create account" },
        { status: 500, headers: CORS_HEADERS },
      );
    }
  }

  if (!token || !userId) {
    return Response.json(
      { error: "Authentication failed" },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  // Re-fetch the user with the fields the mobile app needs.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      banned: true,
      bannedReason: true,
      createdAt: true,
    },
  });

  if (!user) {
    return Response.json(
      { error: "User not found after sign-in" },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  // Banned users get a token but the mobile app will see banned: true and
  // show the BannedModal at boot.
  return Response.json({ token, user }, { status: 200, headers: CORS_HEADERS });
}
