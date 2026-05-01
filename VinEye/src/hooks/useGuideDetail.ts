import { useState, useEffect, useRef } from "react";
import { fetchGuideBySlug } from "@/services/api/guides";
import { mapApiGuideToLocal } from "@/services/api/mappers";
import { cacheGet, cacheSet } from "@/services/cache/cacheManager";
import { getGuideById, type Guide } from "@/data/guides";
import { useNetwork } from "@/contexts/NetworkContext";

type DataSource = "api" | "cache" | "local";

interface UseGuideDetailResult {
  guide: Guide | null;
  isLoading: boolean;
  error: string | null;
  source: DataSource;
}

export function useGuideDetail(guideId: string): UseGuideDetailResult {
  const { isConnected } = useNetwork();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource>("local");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const cacheKey = `guides_${guideId}`;

    async function load() {
      // 1. Check cache
      const cached = await cacheGet<Guide>(cacheKey);
      if (cached && mountedRef.current) {
        setGuide(cached);
        setSource("cache");
        setIsLoading(false);
      }

      // 2. Si offline → on n'attaque pas le réseau (sinon timeout 10s = "infinite loading"
      // perçu par l'utilisateur). Fallback immédiat sur le cache déjà set ci-dessus,
      // ou les données locales bundlées si pas de cache.
      if (!isConnected) {
        if (!cached && mountedRef.current) {
          const local = getGuideById(guideId);
          if (local) {
            setGuide(local);
            setSource("local");
          }
          setIsLoading(false);
        }
        return;
      }

      // 3. Fetch from API (en ligne uniquement)
      const slug = guideId.replace(/_/g, "-");
      const result = await fetchGuideBySlug(slug);

      if (!mountedRef.current) return;

      if (result.success) {
        const mapped = mapApiGuideToLocal(result.data);
        setGuide(mapped);
        setSource("api");
        setError(null);
        await cacheSet(cacheKey, mapped);
      } else if (!cached) {
        // No API, no cache → fallback to local data
        const local = getGuideById(guideId);
        if (local && mountedRef.current) {
          setGuide(local);
          setSource("local");
        }
        setError(result.error.message);
      }

      if (mountedRef.current) setIsLoading(false);
    }

    load();
    return () => { mountedRef.current = false; };
  }, [guideId, isConnected]);

  return { guide, isLoading, error, source };
}
