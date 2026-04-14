// Labels for the TFLite vine detection model
// TODO: Remplacer par les vrais labels du modèle TFLite MobileNetV2
export const VINE_LABELS = [
  'vine',      // 0 — vigne détectée
  'uncertain', // 1 — incertain
  'not_vine',  // 2 — pas une vigne
] as const;

export type VineLabel = (typeof VINE_LABELS)[number];
