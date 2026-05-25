import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { POST } from "./route";
import { ML_CLASSES } from "@/lib/ml/classes";

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
});
