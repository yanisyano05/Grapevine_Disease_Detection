import { auth } from "./auth";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized", status: 401 } as const;
  }
  return { session } as const;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized", status: 401 } as const;
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden", status: 403 } as const;
  }
  return { session } as const;
}

// Mobile auth guard — reads Authorization: Bearer <session-token> via the
// bearer() plugin. Also blocks banned users (banned flag is on User, not
// on Session — we re-fetch from DB).
export async function requireMobileAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return { error: "Unauthorized", status: 401 } as const;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      banned: true,
      bannedReason: true,
    },
  });
  if (!user) {
    return { error: "Unauthorized", status: 401 } as const;
  }
  if (user.banned) {
    return {
      error: "Forbidden",
      status: 403,
      banned: true,
      bannedReason: user.bannedReason,
    } as const;
  }
  return { session, user } as const;
}
