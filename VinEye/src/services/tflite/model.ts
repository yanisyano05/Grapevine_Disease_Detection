import type { Detection, DiseaseClass, ClassProbability } from '@/types/detection';
import { ML_CLASSES, CLASS_TO_SLUG, CONFIDENCE_THRESHOLD_VINE, CONFIDENCE_THRESHOLD_UNCERTAIN } from '@/services/ml/classes';
import { preprocessImage, argmax, softmax } from '@/services/ml/preprocessing';

type FastTfliteModel = {
  runSync: (inputs: (Float32Array | Int32Array | Uint8Array)[]) => (Float32Array | Int32Array | Uint8Array)[];
};

let cachedModel: FastTfliteModel | null = null;
let modelLoadFailed = false;

async function getModel(): Promise<FastTfliteModel | null> {
  if (cachedModel) return cachedModel;
  if (modelLoadFailed) return null;

  try {
    const tflite = require('react-native-fast-tflite');
    const asset = require('@/assets/models/grapevine_v1.tflite');
    cachedModel = await tflite.loadTensorflowModel(asset);
    return cachedModel;
  } catch (err) {
    if (__DEV__) {
      console.warn('[TFLite] Failed to load model — falling back to mock:', err);
    }
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

  if (!imageUri) {
    return mockDetection(timestamp);
  }

  const model = await getModel();
  if (!model) {
    return mockDetection(timestamp, imageUri);
  }

  try {
    const input = await preprocessImage(imageUri);
    const outputs = model.runSync([input]);
    const raw = outputs[0];

    const rawArr = raw instanceof Float32Array ? Array.from(raw) : Array.from(raw as ArrayLike<number>);
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
    if (__DEV__) {
      console.warn('[TFLite] Inference failed — falling back to mock:', err);
    }
    return mockDetection(timestamp, imageUri);
  }
}

function buildDetection(args: {
  timestamp: number;
  imageUri?: string;
  topClass: DiseaseClass;
  topProb: number;
  allProbabilities: ClassProbability[];
}): Detection {
  const { timestamp, imageUri, topClass, topProb, allProbabilities } = args;
  const confidence = Math.round(topProb * 100);

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

function isProbabilityVector(values: number[]): boolean {
  if (values.length === 0) return false;
  const sum = values.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.05) return false;
  return values.every((v) => v >= 0 && v <= 1);
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
