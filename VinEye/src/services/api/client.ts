import { API_CONFIG } from "@/config/api";
import { getToken } from "@/services/auth/tokenStorage";
import { emitAuthEvent } from "@/services/api/authEvents";

if (__DEV__) {
  console.log("[VinEye API] Base URL:", API_CONFIG.baseUrl);
}

export type ApiError = {
  type: "NETWORK" | "TIMEOUT" | "SERVER" | "PARSE" | "UNKNOWN";
  message: string;
  status?: number;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      pagination?: { page: number; limit: number; total: number; pages: number };
    }
  | { success: false; error: ApiError };

type FetchOpts = {
  /** When true, attach the Bearer session token if present. */
  auth?: boolean;
  /** When true, do NOT unwrap json.data — return json directly as T. */
  raw?: boolean;
};

async function buildHeaders(
  base: HeadersInit,
  withAuth: boolean,
): Promise<{ headers: Headers; tokenSent: boolean }> {
  const headers = new Headers(base);
  let tokenSent = false;
  if (withAuth) {
    const token = await getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      tokenSent = true;
    }
  }
  return { headers, tokenSent };
}

async function handleResponse<T>(
  res: Response,
  opts: FetchOpts,
  tokenSent: boolean,
): Promise<ApiResponse<T>> {
  if (!res.ok) {
    // Try to parse the body for richer error info (banned/bannedReason).
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }

    // Only treat 401 as "session lost" when we actually tried to authenticate.
    // A 401 on an anonymous request is just the backend rejecting the call —
    // it must not log the local user out (they may legitimately be a guest).
    if (res.status === 401 && tokenSent) {
      emitAuthEvent({ type: "unauthorized" });
    } else if (
      res.status === 403 &&
      typeof body === "object" &&
      body !== null &&
      (body as { banned?: boolean }).banned === true
    ) {
      emitAuthEvent({
        type: "banned",
        reason: (body as { bannedReason?: string | null }).bannedReason ?? null,
      });
    }

    return {
      success: false,
      error: {
        type: "SERVER",
        message:
          (body as { error?: string } | null)?.error ??
          `Server responded with ${res.status}`,
        status: res.status,
      },
    };
  }

  try {
    const json = await res.json();
    if (opts.raw) {
      return { success: true, data: json as T };
    }
    return {
      success: true,
      data: json.data as T,
      pagination: json.pagination,
    };
  } catch {
    return {
      success: false,
      error: { type: "PARSE", message: "Failed to parse JSON response" },
    };
  }
}

function asApiError(err: unknown): ApiError {
  if (err instanceof DOMException && err.name === "AbortError") {
    return { type: "TIMEOUT", message: "Request timed out" };
  }
  if (err instanceof TypeError) {
    return { type: "NETWORK", message: "No network connection" };
  }
  return {
    type: "UNKNOWN",
    message: err instanceof Error ? err.message : "Unknown error",
  };
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string>,
  opts: FetchOpts = {},
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const { headers, tokenSent } = await buildHeaders(
      { Accept: "application/json" },
      !!opts.auth,
    );
    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return handleResponse<T>(res, opts, tokenSent);
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, error: asApiError(err) };
  }
}

export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  opts: FetchOpts = {},
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const { headers, tokenSent } = await buildHeaders(
      { Accept: "application/json", "Content-Type": "application/json" },
      !!opts.auth,
    );
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return handleResponse<T>(res, opts, tokenSent);
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, error: asApiError(err) };
  }
}
