import { useMemo } from "react";
import { fetchDiseases } from "@/services/api/diseases";
import { mapApiDiseaseToLocal } from "@/services/api/mappers";
import { VINE_DISEASES } from "@/data/diseases";
import { useCachedApiData } from "./useCachedApiData";

interface DiseaseQueryParams {
  severity?: string;
  type?: string;
  search?: string;
}

export function useDiseases(params?: DiseaseQueryParams) {
  const fetchFn = useMemo(
    () => () => fetchDiseases(params),
    [params?.severity, params?.type, params?.search],
  );

  return useCachedApiData({
    cacheKey: "diseases_list",
    fetchFn,
    mapFn: mapApiDiseaseToLocal,
    fallbackData: VINE_DISEASES,
  });
}
