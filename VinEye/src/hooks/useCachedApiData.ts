import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner-native";
import type { ApiResponse } from "@/services/api/client";
import { cacheGet, cacheSet } from "@/services/cache/cacheManager";

type DataSource = "api" | "cache" | "local";

interface UseCachedApiDataResult<T> {
  data: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  source: DataSource;
  refresh: () => Promise<void>;
  lastSyncedAt: Date | null;
}

interface UseCachedApiDataConfig<TApi, TLocal> {
  cacheKey: string;
  fetchFn: () => Promise<ApiResponse<TApi[]>>;
  mapFn: (item: TApi) => TLocal;
  fallbackData: TLocal[];
  ttl?: number;
}

export function useCachedApiData<TApi, TLocal>({
  cacheKey,
  fetchFn,
  mapFn,
  fallbackData,
  ttl,
}: UseCachedApiDataConfig<TApi, TLocal>): UseCachedApiDataResult<TLocal> {
  const [data, setData] = useState<TLocal[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource>("local");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const mountedRef = useRef(true);
  const initialLoadDone = useRef(false);

  const syncKey = `${cacheKey}_lastSync`;

  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (__DEV__) console.log(`[useCachedApiData] ${cacheKey} — loading (force: ${forceRefresh})`);
      if (forceRefresh) setIsRefreshing(true);

      try {
        // 1. Check cache first (unless force refresh)
        if (!forceRefresh) {
          const cached = await cacheGet<TLocal[]>(cacheKey);
          if (cached) {
            if (mountedRef.current) {
              setData(cached);
              setSource("cache");
              setIsLoading(false);

              const syncTs = await cacheGet<number>(syncKey);
              if (syncTs) setLastSyncedAt(new Date(syncTs));
            }
          }
        }

        // 2. Fetch from API
        const result = await fetchFn();

        if (!mountedRef.current) return;

        if (result.success) {
          const mapped = result.data.map(mapFn);
          setData(mapped);
          setSource("api");
          setError(null);
          setLastSyncedAt(new Date());

          await cacheSet(cacheKey, mapped, ttl);
          await cacheSet(syncKey, Date.now(), ttl);

          if (forceRefresh) {
            toast.success("Donnees mises a jour");
          }
        } else {
          // API failed — use cache fallback (even expired)
          if (source !== "cache") {
            const expired = await cacheGet<TLocal[]>(cacheKey);
            if (expired && mountedRef.current) {
              setData(expired);
              setSource("cache");
              if (initialLoadDone.current) {
                toast("Donnees hors-ligne", {
                  description: "Derniere version en cache utilisee",
                });
              }
            } else if (mountedRef.current) {
              setData(fallbackData);
              setSource("local");
              if (initialLoadDone.current) {
                toast.warning("Mode hors-ligne", {
                  description: "Donnees locales utilisees",
                });
              }
            }
          }
          setError(result.error.message);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (mountedRef.current) {
          if (__DEV__) console.log(`[useCachedApiData] ${cacheKey} — done, source: ${source}`);
          setIsLoading(false);
          setIsRefreshing(false);
          initialLoadDone.current = true;
        }
      }
    },
    [cacheKey, fetchFn, mapFn, fallbackData, ttl, syncKey, source],
  );

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => loadData(true), [loadData]);

  return { data, isLoading, isRefreshing, error, source, refresh, lastSyncedAt };
}
