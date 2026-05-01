import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';

// Le modèle Python a été entraîné en 256×256 (MobileNetV2).
// Toute modification doit rester synchronisée avec l'export TFLite.
export const MODEL_INPUT_SIZE = 256;

export async function preprocessImage(uri: string): Promise<Float32Array> {
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
  const input = new Float32Array(pixelCount * 3);

  for (let i = 0; i < pixelCount; i++) {
    input[i * 3 + 0] = rgba[i * 4 + 0] / 255;
    input[i * 3 + 1] = rgba[i * 4 + 1] / 255;
    input[i * 3 + 2] = rgba[i * 4 + 2] / 255;
  }

  return input;
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
