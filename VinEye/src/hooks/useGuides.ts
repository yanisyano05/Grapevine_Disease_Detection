import { useMemo } from "react";
import { fetchGuides } from "@/services/api/guides";
import { mapApiGuideToLocal } from "@/services/api/mappers";
import { PRACTICAL_GUIDES } from "@/data/guides";
import { useCachedApiData } from "./useCachedApiData";

interface GuideQueryParams {
  category?: string;
  search?: string;
}

export function useGuides(params?: GuideQueryParams) {
  const fetchFn = useMemo(
    () => () => fetchGuides(params),
    [params?.category, params?.search],
  );

  return useCachedApiData({
    cacheKey: "guides_list",
    fetchFn,
    mapFn: mapApiGuideToLocal,
    fallbackData: PRACTICAL_GUIDES,
  });
}
