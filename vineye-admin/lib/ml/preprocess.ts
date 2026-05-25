import sharp from "sharp";

export const MODEL_INPUT_SIZE = 224;

/** Décode un data-URI base64 (`data:image/...;base64,XXXX`) en Buffer. */
export function dataUriToBuffer(dataUri: string): Buffer {
  const match = /^data:image\/[a-zA-Z+]+;base64,(.+)$/.exec(dataUri.trim());
  if (!match) {
    throw new Error("Invalid image data-URI");
  }
  return Buffer.from(match[1], "base64");
}

/**
 * Reproduit le preprocessing d'entraînement :
 * resize 224×224 SANS préserver le ratio (fit:"fill"), RGB, normalisation /255.
 * Sortie : Float32Array layout NHWC (H×W×C interleaved), length 224*224*3.
 */
export async function preprocessImage(buffer: Buffer): Promise<Float32Array> {
  const { data } = await sharp(buffer)
    .removeAlpha()
    .resize(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const length = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3;
  const tensor = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    tensor[i] = data[i] / 255;
  }
  return tensor;
}
