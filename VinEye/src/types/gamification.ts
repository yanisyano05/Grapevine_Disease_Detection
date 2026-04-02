export type BadgeId =
  | 'first_scan'
  | 'connoisseur'
  | 'on_fire'
  | 'sharp_eye'
  | 'explorer'
  | 'perfectionist'
  | 'master';

export interface Badge {
  id: BadgeId;
  nameKey: string;
  descKey: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type LevelId =
  | 'bud'
  | 'leaf'
  | 'shoot'
  | 'cluster'
  | 'harvester'
  | 'winemaker'
  | 'cellar_master';

export interface Level {
  id: LevelId;
  labelKey: string;
  minXP: number;
  maxXP: number;
  number: number;
}

export interface GameProgress {
  xp: number;
  level: number;
  badges: Badge[];
  streak: number;
  lastScanDate: string | null;
  totalScans: number;
  uniqueGrapes: string[];
  bestStreak: number;
  highConfidenceScans: number;
}
