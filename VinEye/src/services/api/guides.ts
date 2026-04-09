import { apiGet, type ApiResponse } from "./client";

export interface ApiGuideSection {
  id: string;
  title: string;
  titleEn: string | null;
  body: string;
  bodyEn: string | null;
  image: string | null;
  tip: string | null;
  tipEn: string | null;
  order: number;
}

export interface ApiGuide {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  content: string;
  contentEn: string;
  category: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  order: number;
  createdAt: string;
  // Enriched fields
  readTime: number | null;
  coverImage: string | null;
  sections: ApiGuideSection[];
}

interface FetchGuidesParams {
  category?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export function fetchGuides(
  params?: FetchGuidesParams,
): Promise<ApiResponse<ApiGuide[]>> {
  const clean = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>
    : undefined;
  return apiGet<ApiGuide[]>("/guides", clean);
}

export function fetchGuideBySlug(
  slug: string,
): Promise<ApiResponse<ApiGuide>> {
  return apiGet<ApiGuide>(`/guides/${slug}`);
}
