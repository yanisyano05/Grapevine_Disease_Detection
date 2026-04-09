import { useState, useEffect, useRef } from "react";
import { fetchDiseaseBySlug } from "@/services/api/diseases";
import { mapApiDiseaseToLocal } from "@/services/api/mappers";
import { cacheGet, cacheSet } from "@/services/cache/cacheManager";
import { getDiseaseById, type Disease } from "@/data/diseases";

type DataSource = "api" | "cache" | "local";

interface UseDiseaseDetailResult {
  disease: Disease | null;
  isLoading: boolean;
  error: string | null;
  source: DataSource;
}

export function useDiseaseDetail(diseaseId: string): UseDiseaseDetailResult {
  const [disease, setDisease] = useState<Disease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource>("local");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const cacheKey = `diseases_${diseaseId}`;

    async function load() {
      // 1. Check cache
      const cached = await cacheGet<Disease>(cacheKey);
      if (cached && mountedRef.current) {
        setDisease(cached);
        setSource("cache");
        setIsLoading(false);
      }

      // 2. Fetch from API
      const slug = diseaseId.replace(/_/g, "-");
      const result = await fetchDiseaseBySlug(slug);

      if (!mountedRef.current) return;

      if (result.success) {
        const mapped = mapApiDiseaseToLocal(result.data);
        setDisease(mapped);
        setSource("api");
        setError(null);
        await cacheSet(cacheKey, mapped);
      } else if (!cached) {
        // No API, no cache → fallback to local data
        const local = getDiseaseById(diseaseId);
        if (local && mountedRef.current) {
          setDisease(local);
          setSource("local");
        }
        setError(result.error.message);
      }

      if (mountedRef.current) setIsLoading(false);
    }

    load();
    return () => { mountedRef.current = false; };
  }, [diseaseId]);

  return { disease, isLoading, error, source };
}
