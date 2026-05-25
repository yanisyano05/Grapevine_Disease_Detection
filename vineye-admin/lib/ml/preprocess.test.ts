import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
  dataUriToBuffer,
  preprocessImage,
  MODEL_INPUT_SIZE,
} from "./preprocess";

async function redJpegDataUri(): Promise<string> {
  const buf = await sharp({
    create: { width: 50, height: 50, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .jpeg()
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

describe("dataUriToBuffer", () => {
  it("décode un data-URI base64 en Buffer non vide", async () => {
    const uri = await redJpegDataUri();
    const buf = dataUriToBuffer(uri);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it("lève une erreur sur un data-URI invalide", () => {
    expect(() => dataUriToBuffer("pas-un-data-uri")).toThrow();
  });
});

describe("preprocessImage", () => {
  it("produit un Float32Array NHWC [224*224*3] normalisé dans [0,1]", async () => {
    const uri = await redJpegDataUri();
    const tensor = await preprocessImage(dataUriToBuffer(uri));
    expect(tensor).toBeInstanceOf(Float32Array);
    expect(tensor.length).toBe(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3);
    for (let i = 0; i < tensor.length; i++) {
      expect(tensor[i]).toBeGreaterThanOrEqual(0);
      expect(tensor[i]).toBeLessThanOrEqual(1);
    }
    // Premier pixel rouge : R proche de 1, G/B proches de 0 (tolérance JPEG)
    expect(tensor[0]).toBeGreaterThan(0.8);
    expect(tensor[1]).toBeLessThan(0.2);
  });
});
