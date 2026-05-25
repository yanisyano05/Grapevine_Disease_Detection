import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { predict } from "./inference";
import { ML_CLASSES } from "./classes";

async function greenJpegDataUri(): Promise<string> {
  const buf = await sharp({
    create: { width: 224, height: 224, channels: 3, background: { r: 40, g: 120, b: 40 } },
  })
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

describe("predict", () => {
  it("renvoie une prédiction valide (probas sommant à ~1, classe connue)", async () => {
    const uri = await greenJpegDataUri();
    const r = await predict(uri);

    expect(ML_CLASSES).toContain(r.class);
    expect(["vine", "uncertain", "not_vine"]).toContain(r.status);
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);

    const sum = Object.values(r.probabilities).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 2);
  });
});
