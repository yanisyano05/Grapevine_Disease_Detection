export type DiseaseClass = "black_rot" | "esca" | "healthy" | "leaf_blight";
export type PredictionStatus = "vine" | "uncertain" | "not_vine";

// Ordre IMPÉRATIF = ordre des sorties softmax du modèle (index 0..3).
export const ML_CLASSES: DiseaseClass[] = [
  "black_rot",
  "esca",
  "healthy",
  "leaf_blight",
];

export const CLASS_TO_SLUG: Record<DiseaseClass, string | null> = {
  healthy: null,
  black_rot: "black-rot",
  esca: "esca",
  leaf_blight: "leaf-blight",
};

export const CONFIDENCE_THRESHOLD_VINE = 0.7;
export const CONFIDENCE_THRESHOLD_UNCERTAIN = 0.4;

export interface Prediction {
  status: PredictionStatus;
  class: DiseaseClass;
  slug: string | null;
  confidence: number;
  probabilities: Record<DiseaseClass, number>;
}

export function classify(probabilities: number[]): Prediction {
  if (probabilities.length !== ML_CLASSES.length) {
    throw new Error(
      `Expected ${ML_CLASSES.length} probabilities, got ${probabilities.length}`,
    );
  }

  let topIdx = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[topIdx]) topIdx = i;
  }
  const confidence = probabilities[topIdx];
  const topClass = ML_CLASSES[topIdx];

  let status: PredictionStatus;
  if (confidence >= CONFIDENCE_THRESHOLD_VINE) status = "vine";
  else if (confidence >= CONFIDENCE_THRESHOLD_UNCERTAIN) status = "uncertain";
  else status = "not_vine";

  const probabilitiesMap = ML_CLASSES.reduce(
    (acc, cls, i) => {
      acc[cls] = probabilities[i];
      return acc;
    },
    {} as Record<DiseaseClass, number>,
  );

  return {
    status,
    class: topClass,
    slug: CLASS_TO_SLUG[topClass],
    confidence,
    probabilities: probabilitiesMap,
  };
}
