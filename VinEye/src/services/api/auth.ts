import { apiPost, apiGet } from "@/services/api/client";

// Mirrors what /api/mobile/auth/* returns. Stays loose (Partial<>) so a
// future schema bump on a single field does not crash the mobile app.
export interface MobileServerUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  xp: number;
  level: number;
  banned: boolean;
  bannedReason: string | null;
  createdAt: string;
}

export interface SyncResponse {
  token: string;
  user: MobileServerUser;
}

export interface MeResponse {
  user: MobileServerUser;
}

export async function syncUser(args: {
  name: string;
  email: string;
  deviceId: string;
}) {
  return apiPost<SyncResponse>("/auth/sync", args, { raw: true });
}

export async function fetchMe() {
  return apiGet<MeResponse>("/auth/me", undefined, { auth: true, raw: true });
}

export async function signOutServer() {
  // Best-effort. Backend always returns 204; we don't care about the body.
  return apiPost<unknown>("/auth/sign-out", {}, { auth: true, raw: true });
}
