import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/services/storage';
import type { ScanRecord } from '@/types/detection';

export function useScanDetail(scanId: string) {
  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const all = await storage.get<ScanRecord[]>(storage.KEYS.SCAN_HISTORY);
    const found = all?.find((s) => s.id === scanId) ?? null;
    if (!found) setError('Scan not found');
    setScan(found);
    setLoading(false);
  }, [scanId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = useCallback(async () => {
    const all = await storage.get<ScanRecord[]>(storage.KEYS.SCAN_HISTORY);
    if (!all) return;
    const updated = all.map((s) =>
      s.id === scanId ? { ...s, isFavorite: !s.isFavorite } : s,
    );
    await storage.set(storage.KEYS.SCAN_HISTORY, updated);
    setScan((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : prev));
  }, [scanId]);

  const deleteScan = useCallback(async () => {
    const all = await storage.get<ScanRecord[]>(storage.KEYS.SCAN_HISTORY);
    if (!all) return;
    const updated = all.filter((s) => s.id !== scanId);
    await storage.set(storage.KEYS.SCAN_HISTORY, updated);
  }, [scanId]);

  const renameScan = useCallback(
    async (newName: string) => {
      const trimmed = newName.trim();
      const all = await storage.get<ScanRecord[]>(storage.KEYS.SCAN_HISTORY);
      if (!all) return;
      const updated = all.map((s) =>
        s.id === scanId
          ? { ...s, customName: trimmed.length > 0 ? trimmed : undefined }
          : s,
      );
      await storage.set(storage.KEYS.SCAN_HISTORY, updated);
      setScan((prev) =>
        prev
          ? { ...prev, customName: trimmed.length > 0 ? trimmed : undefined }
          : prev,
      );
    },
    [scanId],
  );

  const setLocation = useCallback(
    async (coords: { latitude: number; longitude: number }) => {
      const capturedAt = new Date().toISOString();
      const all = await storage.get<ScanRecord[]>(storage.KEYS.SCAN_HISTORY);
      if (!all) return;
      const updated = all.map((s) =>
        s.id === scanId
          ? {
              ...s,
              latitude: coords.latitude,
              longitude: coords.longitude,
              locationCapturedAt: capturedAt,
              location: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
            }
          : s,
      );
      await storage.set(storage.KEYS.SCAN_HISTORY, updated);
      setScan((prev) =>
        prev
          ? {
              ...prev,
              latitude: coords.latitude,
              longitude: coords.longitude,
              locationCapturedAt: capturedAt,
              location: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
            }
          : prev,
      );
    },
    [scanId],
  );

  return {
    scan,
    loading,
    error,
    toggleFavorite,
    deleteScan,
    renameScan,
    setLocation,
    refetch: load,
  };
}
