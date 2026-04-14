export type DetectionResult = 'vine' | 'uncertain' | 'not_vine';

export interface Detection {
  result: DetectionResult;
  confidence: number; // 0–100
  cepageId?: string;
  timestamp: number;
  imageUri?: string;
}

export interface ScanRecord {
  id: string;
  detection: Detection;
  xpEarned: number;
  createdAt: string; // ISO date
}
