import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/services/storage';
import type { ScanRecord } from '@/types/detection';

export function useHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const saved = await storage.get<ScanRecord[]>(storage.KEYS.SCAN_HISTORY);
    setHistory(saved ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addScan = useCallback(async (record: ScanRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev];
      storage.set(storage.KEYS.SCAN_HISTORY, updated);
      return updated;
    });
  }, []);

  const deleteScan = useCallback(async (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      storage.set(storage.KEYS.SCAN_HISTORY, updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    setHistory((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      );
      storage.set(storage.KEYS.SCAN_HISTORY, updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    await storage.remove(storage.KEYS.SCAN_HISTORY);
    setHistory([]);
  }, []);

  return { history, isLoading, addScan, deleteScan, toggleFavorite, clearHistory, reload: loadHistory };
}
