import { API_CONFIG } from "@/config/api";

if (__DEV__) {
  console.log("[VinEye API] Base URL:", API_CONFIG.baseUrl);
}

export type ApiError = {
  type: "NETWORK" | "TIMEOUT" | "SERVER" | "PARSE" | "UNKNOWN";
  message: string;
  status?: number;
};

export type ApiResponse<T> =
  | { success: true; data: T; pagination?: { page: number; limit: number; total: number; pages: number } }
  | { success: false; error: ApiError };

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string>,
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
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        error: {
          type: "SERVER",
          message: `Server responded with ${res.status}`,
          status: res.status,
        },
      };
    }

    const json = await res.json();

    return {
      success: true,
      data: json.data as T,
      pagination: json.pagination,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        success: false,
        error: { type: "TIMEOUT", message: "Request timed out" },
      };
    }

    if (err instanceof TypeError) {
      return {
        success: false,
        error: { type: "NETWORK", message: "No network connection" },
      };
    }

    return {
      success: false,
      error: {
        type: "UNKNOWN",
        message: err instanceof Error ? err.message : "Unknown error",
      },
    };
  }
}
