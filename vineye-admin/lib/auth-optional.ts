import type { NextRequest } from "next/server";
import { auth } from "./auth";

/**
 * Résout l'userId si un Bearer token valide est présent, sinon null.
 * Best-effort : ne bloque JAMAIS la requête (endpoint public). N'appelle
 * better-auth que si un header Authorization est présent (évite tout coût
 * DB sur le chemin anonyme).
 */
export async function resolveOptionalUserId(
  request: NextRequest,
): Promise<string | null> {
  if (!request.headers.get("authorization")) {
    return null;
  }
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
