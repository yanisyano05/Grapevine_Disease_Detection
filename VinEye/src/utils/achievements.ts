import type { Badge, BadgeId, Level, LevelId, GameProgress } from '@/types/gamification';

// XP rewards
export const XP_REWARDS = {
  SCAN_SUCCESS: 10,
  NEW_CEEPAGE: 25,
  DAILY_STREAK_BONUS: 5,
  HIGH_CONFIDENCE_BONUS: 5, // confidence > 90%
} as const;

// Level definitions
export const LEVELS: Level[] = [
  { id: 'bud', labelKey: 'levels.bud', minXP: 0, maxXP: 50, number: 1 },
  { id: 'leaf', labelKey: 'levels.leaf', minXP: 51, maxXP: 150, number: 2 },
  { id: 'shoot', labelKey: 'levels.shoot', minXP: 151, maxXP: 300, number: 3 },
  { id: 'cluster', labelKey: 'levels.cluster', minXP: 301, maxXP: 500, number: 4 },
  { id: 'harvester', labelKey: 'levels.harvester', minXP: 501, maxXP: 800, number: 5 },
  { id: 'winemaker', labelKey: 'levels.winemaker', minXP: 801, maxXP: 1200, number: 6 },
  { id: 'cellar_master', labelKey: 'levels.cellarMaster', minXP: 1201, maxXP: 9999, number: 7 },
];

export const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_scan', nameKey: 'achievements.firstScan', descKey: 'achievements.firstScanDesc', icon: '🌱' },
  { id: 'connoisseur', nameKey: 'achievements.connoisseur', descKey: 'achievements.connoisseurDesc', icon: '🍇' },
  { id: 'on_fire', nameKey: 'achievements.onFire', descKey: 'achievements.onFireDesc', icon: '🔥' },
  { id: 'sharp_eye', nameKey: 'achievements.sharpEye', descKey: 'achievements.sharpEyeDesc', icon: '🎯' },
  { id: 'explorer', nameKey: 'achievements.explorer', descKey: 'achievements.explorerDesc', icon: '🌍' },
  { id: 'perfectionist', nameKey: 'achievements.perfectionist', descKey: 'achievements.perfectionistDesc', icon: '⭐' },
  { id: 'master', nameKey: 'achievements.master', descKey: 'achievements.masterDesc', icon: '🏆' },
];

export function createInitialBadges(): Badge[] {
  return BADGE_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: false,
  }));
}

export function getLevelForXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelNumber(xp: number): number {
  return getLevelForXP(xp).number;
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevelForXP(xp);
  const next = LEVELS.find((l) => l.number === current.number + 1);
  return next ?? null;
}

export function getXPProgress(xp: number): { current: number; total: number; ratio: number } {
  const current = getLevelForXP(xp);
  const xpInLevel = xp - current.minXP;
  const total = current.maxXP - current.minXP;
  return {
    current: xpInLevel,
    total,
    ratio: Math.min(xpInLevel / total, 1),
  };
}

export function checkNewBadges(
  progress: GameProgress,
  newBadges: Badge[]
): { badges: Badge[]; newlyUnlocked: BadgeId[] } {
  const newlyUnlocked: BadgeId[] = [];
  const updatedBadges = newBadges.map((badge) => {
    if (badge.unlocked) return badge;

    let shouldUnlock = false;

    switch (badge.id) {
      case 'first_scan':
        shouldUnlock = progress.totalScans >= 1;
        break;
      case 'connoisseur':
        shouldUnlock = progress.uniqueGrapes.length >= 10;
        break;
      case 'on_fire':
        shouldUnlock = progress.streak >= 7;
        break;
      case 'sharp_eye':
        shouldUnlock = progress.highConfidenceScans >= 5;
        break;
      case 'explorer':
        // Simplified: 10+ scans spread across regions (mock check)
        shouldUnlock = progress.totalScans >= 10;
        break;
      case 'perfectionist':
        shouldUnlock = progress.totalScans >= 50;
        break;
      case 'master':
        // Check all others unlocked
        shouldUnlock = newBadges.filter((b) => b.id !== 'master').every((b) => b.unlocked);
        break;
    }

    if (shouldUnlock) {
      newlyUnlocked.push(badge.id);
      return { ...badge, unlocked: true, unlockedAt: new Date().toISOString() };
    }

    return badge;
  });

  return { badges: updatedBadges, newlyUnlocked };
}
