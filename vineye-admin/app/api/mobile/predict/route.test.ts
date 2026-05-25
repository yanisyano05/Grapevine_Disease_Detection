import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { POST } from "./route";
import { ML_CLASSES } from "@/lib/ml/classes";

// vi.mock is hoisted by vitest to the top of the module; the factory runs before
// any imports, so we use vi.importActual to keep the real implementation available
// and only override it in specific tests via mockResolvedValueOnce.
vi.mock("@/lib/ratelimit", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/ratelimit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(actual.checkRateLimit),
  };
});

async function imageDataUri(): Promise<string> {
  const buf = await sharp({
    create: { width: 224, height: 224, channels: 3, background: { r: 40, g: 120, b: 40 } },
  })
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/mobile/predict", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/mobile/predict", () => {
  it("200 + prediction sur image valide", async () => {
    const res = await POST(makeRequest({ image: await imageDataUri() }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(ML_CLASSES).toContain(json.prediction.class);
    expect(json.prediction).toHaveProperty("status");
    expect(json.prediction).toHaveProperty("confidence");
    expect(Object.keys(json.prediction.probabilities)).toHaveLength(4);
  });

  it("400 sur JSON invalide", async () => {
    const req = new NextRequest("http://localhost/api/mobile/predict", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ pas du json",
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("400 sur image manquante", async () => {
    expect((await POST(makeRequest({}))).status).toBe(400);
  });

  it("413 sur image trop grande (décodée > 2 MB)", async () => {
    // Build a data-URI whose base64 body decodes to > 2 MB.
    // 2 MB = 2_097_152 bytes → base64 chars needed: ceil(2_097_152 * 4/3) ≈ 2_796_203.
    // We use 3_000_000 'A' chars (decodes to ~2.25 MB) to safely exceed the limit.
    const bigB64 = "A".repeat(3_000_000);
    const bigImage = `data:image/jpeg;base64,${bigB64}`;
    const res = await POST(makeRequest({ image: bigImage }));
    expect(res.status).toBe(413);
  });
});

describe("POST /api/mobile/predict — rate limit", () => {
  beforeEach(async () => {
    // Override checkRateLimit to return rate-limited for all tests in this block
    const { checkRateLimit } = await import("@/lib/ratelimit");
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      retryAfterSec: 30,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("429 + Retry-After quand le rate limit est dépassé", async () => {
    const res = await POST(makeRequest({ image: "data:image/jpeg;base64,/9j/abc" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
  });
});
