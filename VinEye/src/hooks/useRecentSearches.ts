import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@vineye:recent_searches';
const MAX_RECENTS = 10;

export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((data) => {
        if (!data) return;
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            setRecents(parsed.filter((q): q is string => typeof q === 'string'));
          }
        } catch {
          // ignore corrupt cache
        }
      })
      .catch(() => undefined);
  }, []);

  const persist = useCallback((next: string[]) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const addRecent = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length === 0) return;
      setRecents((prev) => {
        const next = [
          trimmed,
          ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, MAX_RECENTS);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeRecent = useCallback(
    (query: string) => {
      setRecents((prev) => {
        const next = prev.filter((q) => q !== query);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearRecents = useCallback(() => {
    setRecents([]);
    AsyncStorage.removeItem(KEY).catch(() => undefined);
  }, []);

  return { recents, addRecent, removeRecent, clearRecents };
}
