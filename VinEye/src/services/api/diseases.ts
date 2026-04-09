import { apiGet, type ApiResponse } from "./client";

export interface ApiDiseaseImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

export interface ApiDisease {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  scientificName: string;
  type: "FUNGAL" | "BACTERIAL" | "PEST" | "ABIOTIC";
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  descriptionEn: string;
  symptoms: string[];
  symptomsEn: string[];
  treatment: string;
  treatmentEn: string;
  season: string;
  seasonEn: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  imageUrl: string | null;
  createdAt: string;
  // Enriched fields
  startMonth: number | null;
  endMonth: number | null;
  peakMonth: number | null;
  conditions: string[];
  conditionsEn: string[];
  preventiveActions: string[];
  preventiveActionsEn: string[];
  curativeActions: string[];
  curativeActionsEn: string[];
  impactedParts: string[];
  impactedPartsEn: string[];
  spreadMethod: string | null;
  spreadMethodEn: string | null;
  images: ApiDiseaseImage[];
}

interface FetchDiseasesParams {
  severity?: string;
  type?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export function fetchDiseases(
  params?: FetchDiseasesParams,
): Promise<ApiResponse<ApiDisease[]>> {
  const clean = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>
    : undefined;
  return apiGet<ApiDisease[]>("/diseases", clean);
}

export function fetchDiseaseBySlug(
  slug: string,
): Promise<ApiResponse<ApiDisease>> {
  return apiGet<ApiDisease>(`/diseases/${slug}`);
}
