// Variant WEB de model.ts : pas de TFLite natif sur navigateur. L'inférence
// est déléguée à l'endpoint serveur POST /api/mobile/predict. Même interface
// publique que model.ts (loadModel, runInference) pour que useDetection et le
// Scanner fonctionnent sans changement.
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import type { Detection, ClassProbability, DiseaseClass } from '@/types/detection';
import { ML_CLASSES } from '@/services/ml/classes';
import { apiPost } from '@/services/api/client';

const MODEL_INPUT_SIZE = 224;

interface ServerPrediction {
  status: 'vine' | 'uncertain' | 'not_vine';
  class: DiseaseClass;
  slug: string | null;
  confidence: number; // 0..1
  probabilities: Record<DiseaseClass, number>;
}

// Aucun modèle local à charger sur web : l'inférence est distante.
export async function loadModel(): Promise<boolean> {
  return true;
}

/** Mappe la réponse serveur vers le type Detection (convention projet : confidence 0-100). */
export function predictionToDetection(
  p: ServerPrediction,
  imageUri: string | undefined,
  timestamp: number,
): Detection {
  const allProbabilities: ClassProbability[] = ML_CLASSES.map((cls) => ({
    class: cls,
    probability: p.probabilities?.[cls] ?? 0,
  }));
  return {
    result: p.status,
    confidence: Math.round((p.confidence ?? 0) * 100),
    diseaseClass: p.class,
    diseaseSlug: p.slug ?? undefined,
    allProbabilities,
    timestamp,
    imageUri,
  };
}

export async function runInference(imageUri?: string): Promise<Detection> {
  const timestamp = Date.now();

  if (!imageUri) {
    return predictionToDetection(
      {
        status: 'not_vine',
        class: 'healthy',
        slug: null,
        confidence: 0,
        probabilities: { healthy: 0, black_rot: 0, esca: 0, leaf_blight: 0 },
      },
      undefined,
      timestamp,
    );
  }

  // Redimensionne à 224² + base64 (expo-image-manipulator fonctionne sur web).
  const resized = await manipulateAsync(
    imageUri,
    [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
    { format: SaveFormat.JPEG, base64: true, compress: 0.85 },
  );
  if (!resized.base64) {
    throw new Error('Image manipulation did not return base64');
  }
  const dataUri = `data:image/jpeg;base64,${resized.base64}`;

  const res = await apiPost<{ prediction: ServerPrediction }>(
    '/predict',
    { image: dataUri },
    { raw: true },
  );
  if (!res.success) {
    throw new Error(res.error.message || 'Inference request failed');
  }

  return predictionToDetection(res.data.prediction, imageUri, timestamp);
}
