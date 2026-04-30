import type { DiseaseClass } from '@/types/detection';

export const ML_CLASSES: DiseaseClass[] = ['black_rot', 'esca', 'healthy', 'leaf_blight'];

export const CLASS_TO_SLUG: Record<DiseaseClass, string | null> = {
  healthy: null,
  black_rot: 'black-rot',
  esca: 'esca',
  leaf_blight: 'leaf-blight',
};

export const CLASS_TO_LABEL_KEY: Record<DiseaseClass, string> = {
  healthy: 'detection.healthy',
  black_rot: 'diseases.blackRot.name',
  esca: 'diseases.esca.name',
  leaf_blight: 'diseases.leafBlight.name',
};

export const CONFIDENCE_THRESHOLD_VINE = 0.7;
export const CONFIDENCE_THRESHOLD_UNCERTAIN = 0.4;
