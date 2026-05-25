import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  retryAfterSec: number;
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// 20 requêtes / minute / IP (inférence coûteuse). Sliding window.
const limiter =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(20, "60 s"),
        prefix: "ratelimit:predict",
      })
    : null;

/**
 * Vérifie le quota IP. Si Upstash n'est pas configuré (env vars absentes),
 * autorise et log un warning — utile en dev/test, à configurer en prod.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!limiter) {
    console.warn("[ratelimit] Upstash non configuré — rate limit désactivé");
    return { success: true, retryAfterSec: 0 };
  }
  const { success, reset } = await limiter.limit(ip);
  const retryAfterSec = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return { success, retryAfterSec };
}
