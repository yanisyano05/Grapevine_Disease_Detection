import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/services/storage';
import { DEFAULT_PROFILE, type UserProfile } from '@/types/user';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const saved = await storage.get<UserProfile>(storage.KEYS.USER_PROFILE);
    setProfile(saved ?? DEFAULT_PROFILE);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next: UserProfile = { ...prev, ...partial };
      storage.set(storage.KEYS.USER_PROFILE, next);
      return next;
    });
  }, []);

  return { profile, updateProfile, isLoading, reload: loadProfile };
}
