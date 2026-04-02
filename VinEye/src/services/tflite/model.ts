// TODO: Remplacer par le vrai modèle TFLite (MobileNetV2 fine-tuné sur dataset vignes)
import type { Detection, DetectionResult } from '@/types/detection';
import { cepages } from '@/utils/cepages';

const WEIGHTED_RESULTS: { result: DetectionResult; weight: number }[] = [
  { result: 'vine', weight: 70 },
  { result: 'uncertain', weight: 20 },
  { result: 'not_vine', weight: 10 },
];

function weightedRandom(): DetectionResult {
  const total = WEIGHTED_RESULTS.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * total;
  for (const r of WEIGHTED_RESULTS) {
    rand -= r.weight;
    if (rand <= 0) return r.result;
  }
  return 'vine';
}

// TODO: Remplacer par le vrai modèle TFLite
export async function loadModel(): Promise<boolean> {
  // Simule le chargement du modèle (1-2 secondes)
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));
  return true;
}

// TODO: Remplacer par le vrai modèle TFLite
export async function runInference(imageUri?: string): Promise<Detection> {
  // Simule l'inférence (200-600ms)
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 400));

  const result = weightedRandom();
  const confidence = result === 'vine'
    ? Math.floor(70 + Math.random() * 30)      // 70–100%
    : result === 'uncertain'
    ? Math.floor(40 + Math.random() * 30)      // 40–70%
    : Math.floor(10 + Math.random() * 30);     // 10–40%

  const cepageId =
    result === 'vine'
      ? cepages[Math.floor(Math.random() * cepages.length)].id
      : undefined;

  return {
    result,
    confidence,
    cepageId,
    timestamp: Date.now(),
    imageUri,
  };
}
