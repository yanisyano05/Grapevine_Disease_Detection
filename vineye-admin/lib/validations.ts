import { z } from "zod/v4";

export const diseaseSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200).trim(),
  nameEn: z.string().max(200).trim().optional().default(""),
  scientificName: z.string().max(200).trim().optional().default(""),
  slug: z.string().max(100).trim().optional(),
  type: z.enum(["FUNGAL", "BACTERIAL", "PEST", "ABIOTIC"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  description: z.string().min(1, "Description requise").trim(),
  descriptionEn: z.string().trim().optional().default(""),
  symptoms: z.array(z.string().trim()).min(1, "Au moins un symptome"),
  symptomsEn: z.array(z.string().trim()).optional().default([]),
  treatment: z.string().min(1, "Traitement requis").trim(),
  treatmentEn: z.string().trim().optional().default(""),
  season: z.string().min(1, "Saison requise").trim(),
  seasonEn: z.string().trim().optional().default(""),
  iconName: z.string().trim().optional().default("leaf"),
  iconColor: z.string().trim().optional().default("#1D9E75"),
  bgColor: z.string().trim().optional().default("#E1F5EE"),
  imageUrl: z.string().url().optional().nullable(),
  published: z.boolean().optional().default(true),
});

export const guideSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200).trim(),
  titleEn: z.string().max(200).trim().optional().default(""),
  slug: z.string().max(100).trim().optional(),
  subtitle: z.string().min(1, "Sous-titre requis").max(500).trim(),
  subtitleEn: z.string().max(500).trim().optional().default(""),
  content: z.string().min(1, "Contenu requis").trim(),
  contentEn: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default("general"),
  iconName: z.string().trim().optional().default("book"),
  iconColor: z.string().trim().optional().default("#185FA5"),
  bgColor: z.string().trim().optional().default("#E6F1FB"),
  published: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

export const alertSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200).trim(),
  titleEn: z.string().max(200).trim().optional().default(""),
  message: z.string().min(1, "Message requis").trim(),
  messageEn: z.string().trim().optional().default(""),
  type: z.enum(["WARNING", "INFO", "DANGER"]).optional().default("WARNING"),
  region: z.string().trim().optional().default("bordeaux"),
  active: z.boolean().optional().default(true),
  activeFrom: z.coerce.date().optional(),
  activeTo: z.coerce.date().optional().nullable(),
});

export const scanSchema = z.object({
  diseaseId: z.string().optional().nullable(),
  confidence: z.number().min(0).max(1),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  deviceId: z.string().optional().nullable(),
});

export type DiseaseInput = z.infer<typeof diseaseSchema>;
export type GuideInput = z.infer<typeof guideSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type ScanInput = z.infer<typeof scanSchema>;
