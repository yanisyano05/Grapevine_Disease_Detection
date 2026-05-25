import { NextRequest } from "next/server";
import { mobilePredictSchema } from "@/lib/validations";
import { predict } from "@/lib/ml/inference";
import { checkRateLimit } from "@/lib/ratelimit";
import { resolveOptionalUserId } from "@/lib/auth-optional";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB décodé

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-API-Version": "1.0",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Taille décodée approximative d'un payload base64 (corps après la virgule). */
function decodedBase64Size(dataUri: string): number {
  const comma = dataUri.indexOf(",");
  const b64 = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
  return Math.floor((b64.length * 3) / 4);
}

export async function POST(request: NextRequest) {
  // 1. Rate limit IP
  const rate = await checkRateLimit(clientIp(request));
  if (!rate.success) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { ...CORS_HEADERS, "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  // 1b. Content-Length early gate (best-effort: header can be absent or spoofed;
  //     the authoritative decoded-size check is in step 4).
  const RAW_LIMIT = 3 * 1024 * 1024; // 3 MB — covers 2 MB image + base64/JSON overhead
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null && parseInt(contentLength, 10) > RAW_LIMIT) {
    return Response.json(
      { error: "Image too large" },
      { status: 413, headers: CORS_HEADERS },
    );
  }

  // 2. Parse JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // 3. Validation format
  const parsed = mobilePredictSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // 4. Garde-fou taille (413)
  if (decodedBase64Size(parsed.data.image) > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "Image too large" },
      { status: 413, headers: CORS_HEADERS },
    );
  }

  // 5. Identité best-effort (non bloquante, réservée à un usage futur)
  await resolveOptionalUserId(request);

  // 6. Inférence
  try {
    const prediction = await predict(parsed.data.image);
    return Response.json({ prediction }, { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error("[predict] inference failed:", err);
    return Response.json(
      { error: "Inference failed" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
