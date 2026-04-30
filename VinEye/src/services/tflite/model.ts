/**
 * MOCK TFLite Service
 *
 * Ce service retourne actuellement des résultats simulés (random pondéré).
 * Les libs `react-native-fast-tflite` et `react-native-nitro-modules` ont été
 * désinstallées temporairement car :
 *   - Le modèle ML n'est pas encore exporté en .tflite final (précision insuffisante)
 *   - Les builds Android C++ (CMake/Ninja + Nitro headers) étaient instables sur Windows
 *
 * L'interface publique reste identique :
 *   - `loadModel(): Promise<boolean>` — retourne false (pas de modèle chargé)
 *   - `runInference(imageUri?: string): Promise<Detection>` — renvoie un mock pondéré
 *
 * RÉINTÉGRATION DU VRAI MODÈLE (quand le .tflite sera prêt) :
 *   1. pnpm add react-native-fast-tflite react-native-nitro-modules
 *   2. Vérifier que `src/assets/models/grapevine_v1.tflite` est présent
 *   3. Remplacer `runInference` ci-dessous par l'implémentation native :
 *        const tflite = require('react-native-fast-tflite');
 *        const asset = require('@/assets/models/grapevine_v1.tflite');
 *        const model = await tflite.loadTensorflowModel(asset);
 *        const input = await preprocessImage(imageUri);  // depuis services/ml/preprocessing
 *        const outputs = model.runSync([input]);
 *        // ... softmax/argmax → buildDetection
 *   4. pnpm dlx expo prebuild --clean
 *   5. pnpm dlx expo run:android (ou EAS Build pour éviter les soucis CMake Windows)
 *
 * Documentation : https://github.com/mrousavy/react-native-fast-tflite
 */

import type { Detection, DiseaseClass, ClassProbability } from '@/types/detection';
import {
  ML_CLASSES,
  CLASS_TO_SLUG,
  CONFIDENCE_THRESHOLD_VINE,
  CONFIDENCE_THRESHOLD_UNCERTAIN,
} from '@/services/ml/classes';
import { argmax } from '@/services/ml/preprocessing';

export async function loadModel(): Promise<boolean> {
  return false;
}

export async function runInference(imageUri?: string): Promise<Detection> {
  return mockDetection(Date.now(), imageUri);
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
