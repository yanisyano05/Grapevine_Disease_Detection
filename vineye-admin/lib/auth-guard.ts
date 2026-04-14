import { auth } from "./auth";
import { headers } from "next/headers";

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
