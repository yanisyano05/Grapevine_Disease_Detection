export type DetectionResult = 'vine' | 'uncertain' | 'not_vine';

export type DiseaseClass = 'healthy' | 'black_rot' | 'esca' | 'leaf_blight';

export interface ClassProbability {
  class: DiseaseClass;
  probability: number;
}

export interface Detection {
  result: DetectionResult;
  confidence: number;
  diseaseClass?: DiseaseClass;
  diseaseSlug?: string;
  allProbabilities?: ClassProbability[];
  cepageId?: string;
  timestamp: number;
  imageUri?: string;
}

export interface ScanRecord {
  id: string;
  detection: Detection;
  xpEarned: number;
  createdAt: string;
  isFavorite?: boolean;
  customName?: string;
  latitude?: number;
  longitude?: number;
  locationCapturedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    placeName?: string;
  } | null;
}

export type ScanStatus = 'healthy' | 'infected' | 'uncertain' | 'not_vine';

export function getScanStatus(scan: ScanRecord): ScanStatus {
  if (scan.detection.result === 'not_vine') return 'not_vine';
  const cls = scan.detection.diseaseClass;
  if (cls === 'healthy') return 'healthy';
  if (cls === 'black_rot' || cls === 'esca' || cls === 'leaf_blight') return 'infected';
  return 'uncertain';
}
