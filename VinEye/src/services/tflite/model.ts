/**
 * TFLite Service — VinEye
 *
 * Inférence réelle via react-native-fast-tflite.
 * Modèle : assets/models/grapevine_v1.tflite (MobileNetV2, 4 classes, 256×256)
 *
 * Limitations connues :
 *   - Le modèle a une accuracy validation faible (~25% — overfitting connu)
 *   - Pas de classe "not_vine" : tout sera classifié dans une des 4 classes
 *   - Voir docs/audit_report.md pour le diagnostic complet
 *
 * En cas d'échec de chargement, fallback sur mockDetection() pour ne pas casser l'UX.
 */

import type {
  Detection,
  DiseaseClass,
  ClassProbability,
} from '@/types/detection';
import {
  ML_CLASSES,
  CLASS_TO_SLUG,
  CONFIDENCE_THRESHOLD_VINE,
  CONFIDENCE_THRESHOLD_UNCERTAIN,
} from '@/services/ml/classes';
import {
  preprocessImage,
  argmax,
  softmax,
} from '@/services/ml/preprocessing';

type FastTfliteModel = {
  runSync: (
    inputs: (Float32Array | Int32Array | Uint8Array)[],
  ) => (Float32Array | Int32Array | Uint8Array)[];
};

let cachedModel: FastTfliteModel | null = null;
let modelLoadFailed = false;

async function getModel(): Promise<FastTfliteModel | null> {
  if (cachedModel) return cachedModel;
  if (modelLoadFailed) return null;

  try {
    console.log('[TFLite] Loading model...');
    const start = Date.now();
    // require dynamique pour ne pas crasher si la lib n'est pas installée.
    // Path RELATIF (pas '@/') car require runtime ne résout pas les alias TS.
    const tflite = require('react-native-fast-tflite');
    const asset = require('../../assets/models/grapevine_v1.tflite');
    const loaded: FastTfliteModel = await tflite.loadTensorflowModel(asset);
    cachedModel = loaded;
    console.log(`[TFLite] Model loaded in ${Date.now() - start}ms`);
    return loaded;
  } catch (err) {
    console.error('[TFLite] Failed to load model:', err);
    modelLoadFailed = true;
    return null;
  }
}

export async function loadModel(): Promise<boolean> {
  const m = await getModel();
  return m !== null;
}

export async function runInference(imageUri?: string): Promise<Detection> {
  const timestamp = Date.now();

  // Pas d'image fournie → mock (utile pour le dev sans capture)
  if (!imageUri) {
    return mockDetection(timestamp);
  }

  const model = await getModel();
  if (!model) {
    console.warn('[TFLite] Model unavailable, falling back to mock');
    return mockDetection(timestamp, imageUri);
  }

  try {
    const t0 = Date.now();
    const input = await preprocessImage(imageUri);
    const t1 = Date.now();
    console.log(`[TFLite] Preprocess: ${t1 - t0}ms`);

    const outputs = model.runSync([input]);
    const t2 = Date.now();
    console.log(
      `[TFLite] Inference: ${t2 - t1}ms (total: ${t2 - t0}ms)`,
    );

    if (t2 - t0 > 500) {
      console.warn(`[TFLite] Slow inference: ${t2 - t0}ms`);
    }

    const raw = outputs[0];
    const rawArr =
      raw instanceof Float32Array
        ? Array.from(raw)
        : Array.from(raw as ArrayLike<number>);
    const probs = isProbabilityVector(rawArr) ? rawArr : softmax(rawArr);

    const idx = argmax(probs);
    const topClass = ML_CLASSES[idx];
    const topProb = probs[idx];

    const allProbabilities: ClassProbability[] = ML_CLASSES.map((cls, i) => ({
      class: cls,
      probability: probs[i],
    }));

    return buildDetection({
      timestamp,
      imageUri,
      topClass,
      topProb,
      allProbabilities,
    });
  } catch (err) {
    console.error('[TFLite] Inference failed:', err);
    return mockDetection(timestamp, imageUri);
  }
}

function isProbabilityVector(values: number[]): boolean {
  if (values.length === 0) return false;
  const sum = values.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.05) return false;
  return values.every((v) => v >= 0 && v <= 1);
}

function buildDetection(args: {
  timestamp: number;
  imageUri?: string;
  topClass: DiseaseClass;
  topProb: number;
  allProbabilities: ClassProbability[];
}): Detection {
  const { timestamp, imageUri, topClass, topProb, allProbabilities } = args;
  const confidence = Math.round(topProb * 100); // convention projet : 0-100

  const result =
    topProb >= CONFIDENCE_THRESHOLD_VINE
      ? 'vine'
      : topProb >= CONFIDENCE_THRESHOLD_UNCERTAIN
        ? 'uncertain'
        : 'not_vine';

  return {
    result,
    confidence,
    diseaseClass: topClass,
    diseaseSlug: CLASS_TO_SLUG[topClass] ?? undefined,
    allProbabilities,
    timestamp,
    imageUri,
  };
}

function mockDetection(timestamp: number, imageUri?: string): Detection {
  const probs = randomProbabilities();
  const idx = argmax(probs);
  const topClass = ML_CLASSES[idx];
  const allProbabilities: ClassProbability[] = ML_CLASSES.map((cls, i) => ({
    class: cls,
    probability: probs[i],
  }));
  return buildDetection({
    timestamp,
    imageUri,
    topClass,
    topProb: probs[idx],
    allProbabilities,
  });
}

function randomProbabilities(): number[] {
  const raw = ML_CLASSES.map(() => Math.random());
  const sum = raw.reduce((a, b) => a + b, 0);
  const normalized = raw.map((v) => v / sum);
  const boostIdx = Math.floor(Math.random() * ML_CLASSES.length);
  normalized[boostIdx] = Math.min(1, normalized[boostIdx] + 0.5);
  const newSum = normalized.reduce((a, b) => a + b, 0);
  return normalized.map((v) => v / newSum);
}
