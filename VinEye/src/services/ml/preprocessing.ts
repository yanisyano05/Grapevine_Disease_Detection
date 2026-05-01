import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';

// Le .tflite exporté attend [1, 224, 224, 3] (la shape par défaut MobileNetV2,
// confirmée par model.inputs[0].shape sur device). Si tu réexportes le modèle
// avec une autre shape, mets à jour cette constante en miroir — sinon le
// preprocess produit un buffer de mauvaise taille et l'inférence tourne sur
// des données décadrées (= prédictions aléatoires sans erreur visible).
export const MODEL_INPUT_SIZE = 224;

export type TfliteInputDType = 'float32' | 'float16' | 'uint8' | 'int8';

export type TfliteInputArray =
  | Float32Array
  | Uint8Array
  | Int8Array;

export async function preprocessImage(
  uri: string,
  dtype: TfliteInputDType | string = 'float32',
): Promise<TfliteInputArray> {
  const resized = await manipulateAsync(
    uri,
    [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
    { format: SaveFormat.JPEG, base64: true, compress: 0.92 },
  );

  if (!resized.base64) {
    throw new Error('Image manipulation did not return base64');
  }

  const jpegBytes = base64ToBytes(resized.base64);
  const decoded = jpeg.decode(jpegBytes, { useTArray: true });

  if (decoded.width !== MODEL_INPUT_SIZE || decoded.height !== MODEL_INPUT_SIZE) {
    throw new Error(
      `Decoded image is ${decoded.width}x${decoded.height}, expected ${MODEL_INPUT_SIZE}x${MODEL_INPUT_SIZE}`,
    );
  }

  const rgba = decoded.data;
  const pixelCount = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;

  // Quantized models keep the original 0-255 byte range.
  if (dtype === 'uint8') {
    const out = new Uint8Array(pixelCount * 3);
    for (let i = 0; i < pixelCount; i++) {
      out[i * 3 + 0] = rgba[i * 4 + 0];
      out[i * 3 + 1] = rgba[i * 4 + 1];
      out[i * 3 + 2] = rgba[i * 4 + 2];
    }
    return out;
  }

  if (dtype === 'int8') {
    const out = new Int8Array(pixelCount * 3);
    for (let i = 0; i < pixelCount; i++) {
      // shift to [-128, 127]
      out[i * 3 + 0] = rgba[i * 4 + 0] - 128;
      out[i * 3 + 1] = rgba[i * 4 + 1] - 128;
      out[i * 3 + 2] = rgba[i * 4 + 2] - 128;
    }
    return out;
  }

  // Default float32 path: normalised to [0, 1] (matches the Keras
  // preprocess_input used during training when rescale=1./255).
  const out = new Float32Array(pixelCount * 3);
  for (let i = 0; i < pixelCount; i++) {
    out[i * 3 + 0] = rgba[i * 4 + 0] / 255;
    out[i * 3 + 1] = rgba[i * 4 + 1] / 255;
    out[i * 3 + 2] = rgba[i * 4 + 2] / 255;
  }
  return out;
}

function base64ToBytes(base64: string): Uint8Array {
  const cleaned = base64.replace(/[\r\n]/g, '');
  const bin = globalThis.atob ? globalThis.atob(cleaned) : decodeBase64Fallback(cleaned);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function decodeBase64Fallback(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '=') break;
    const v = chars.indexOf(c);
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return out;
}

export function softmax(logits: Float32Array | number[]): number[] {
  const arr = Array.from(logits);
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

export function argmax(values: number[] | Float32Array): number {
  let best = 0;
  let bestVal = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > bestVal) {
      bestVal = values[i];
      best = i;
    }
  }
  return best;
}
