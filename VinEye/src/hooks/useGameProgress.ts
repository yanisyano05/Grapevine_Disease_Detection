import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/services/storage';
import type { GameProgress, BadgeId } from '@/types/gamification';
import type { Detection } from '@/types/detection';
import {
  createInitialBadges,
  checkNewBadges,
  getLevelNumber,
  XP_REWARDS,
} from '@/utils/achievements';

const INITIAL_PROGRESS: GameProgress = {
  xp: 0,
  level: 1,
  badges: createInitialBadges(),
  streak: 0,
  lastScanDate: null,
  totalScans: 0,
  uniqueGrapes: [],
  bestStreak: 0,
  highConfidenceScans: 0,
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, reference: Date): boolean {
  const yesterday = new Date(reference);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(INITIAL_PROGRESS);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<BadgeId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    const saved = await storage.get<GameProgress>(storage.KEYS.GAME_PROGRESS);
    setProgress(saved ?? INITIAL_PROGRESS);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const processDetection = useCallback(async (detection: Detection): Promise<number> => {
    let xpEarned = 0;

    setProgress((prev) => {
      const now = new Date();
      const lastDate = prev.lastScanDate ? new Date(prev.lastScanDate) : null;

      // Update streak
      let newStreak = prev.streak;
      if (detection.result === 'vine') {
        if (!lastDate || isYesterday(lastDate, now)) {
          newStreak = prev.streak + 1;
        } else if (!lastDate || !isSameDay(lastDate, now)) {
          newStreak = 1;
        }
        // Same day — no streak change
      }

      // Calculate XP
      if (detection.result === 'vine') {
        xpEarned += XP_REWARDS.SCAN_SUCCESS;

        if (detection.cepageId && !prev.uniqueGrapes.includes(detection.cepageId)) {
          xpEarned += XP_REWARDS.NEW_CEEPAGE;
        }

        if (newStreak > prev.streak) {
          xpEarned += XP_REWARDS.DAILY_STREAK_BONUS;
        }

        if (detection.confidence > 90) {
          xpEarned += XP_REWARDS.HIGH_CONFIDENCE_BONUS;
        }
      }

      const newXP = prev.xp + xpEarned;
      const newLevel = getLevelNumber(newXP);

      const updatedUniqueGrapes =
        detection.cepageId && !prev.uniqueGrapes.includes(detection.cepageId)
          ? [...prev.uniqueGrapes, detection.cepageId]
          : prev.uniqueGrapes;

      const updatedTotalScans = prev.totalScans + 1;
      const updatedHighConf =
        detection.result === 'vine' && detection.confidence > 95
          ? prev.highConfidenceScans + 1
          : prev.highConfidenceScans;

      const nextProgress: GameProgress = {
        ...prev,
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        lastScanDate: new Date().toISOString(),
        totalScans: updatedTotalScans,
        uniqueGrapes: updatedUniqueGrapes,
        highConfidenceScans: updatedHighConf,
        badges: prev.badges,
      };

      // Check badges
      const { badges, newlyUnlocked } = checkNewBadges(nextProgress, prev.badges);
      nextProgress.badges = badges;

      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedBadges(newlyUnlocked);
      }

      // Persist
      storage.set(storage.KEYS.GAME_PROGRESS, nextProgress);

      return nextProgress;
    });

    return xpEarned;
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlockedBadges([]);
  }, []);

  const resetProgress = useCallback(async () => {
    await storage.remove(storage.KEYS.GAME_PROGRESS);
    setProgress(INITIAL_PROGRESS);
  }, []);

  return {
    progress,
    isLoading,
    processDetection,
    newlyUnlockedBadges,
    clearNewlyUnlocked,
    resetProgress,
    reload: loadProgress,
  };
}
