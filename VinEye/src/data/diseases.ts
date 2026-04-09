export interface DiseaseTimeline {
  startMonth: number;
  endMonth: number;
  peakMonth: number;
}

export interface Disease {
  id: string;
  name: string;
  type: "fungal" | "bacterial" | "pest" | "abiotic";
  icon: string;
  iconColor: string;
  bgColor: string;
  severity: "high" | "medium" | "low";
  description: string;
  symptoms: string[];
  treatment: string;
  season: string;
  // Detail fields
  images: string[];
  timeline: DiseaseTimeline;
  conditions: string[];
  preventiveActions: string[];
  curativeActions: string[];
  impactedParts: string[];
  spreadMethod: string;
}

export const VINE_DISEASES: Disease[] = [
  {
    id: "mildiou",
    name: "diseases.mildiou.name",
    type: "fungal",
    icon: "water-outline",
    iconColor: "#BA7517",
    bgColor: "#FAEEDA",
    severity: "high",
    description: "diseases.mildiou.description",
    symptoms: [
      "diseases.mildiou.symptom1",
      "diseases.mildiou.symptom2",
      "diseases.mildiou.symptom3",
    ],
    treatment: "diseases.mildiou.treatment",
    season: "diseases.mildiou.season",
    images: [
      "https://images.unsplash.com/photo-1596142780450-01a1f79c400c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&h=600&fit=crop",
    ],
    timeline: { startMonth: 5, endMonth: 8, peakMonth: 6 },
    conditions: [
      "diseases.mildiou.condition1",
      "diseases.mildiou.condition2",
      "diseases.mildiou.condition3",
    ],
    preventiveActions: [
      "diseases.mildiou.preventive1",
      "diseases.mildiou.preventive2",
      "diseases.mildiou.preventive3",
    ],
    curativeActions: [
      "diseases.mildiou.curative1",
      "diseases.mildiou.curative2",
    ],
    impactedParts: [
      "diseases.mildiou.part1",
      "diseases.mildiou.part2",
      "diseases.mildiou.part3",
    ],
    spreadMethod: "diseases.mildiou.spread",
  },
  {
    id: "oidium",
    name: "diseases.oidium.name",
    type: "fungal",
    icon: "snow-outline",
    iconColor: "#534AB7",
    bgColor: "#EEEDFE",
    severity: "high",
    description: "diseases.oidium.description",
    symptoms: [
      "diseases.oidium.symptom1",
      "diseases.oidium.symptom2",
    ],
    treatment: "diseases.oidium.treatment",
    season: "diseases.oidium.season",
    images: [
      "https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop",
    ],
    timeline: { startMonth: 4, endMonth: 9, peakMonth: 7 },
    conditions: [
      "diseases.oidium.condition1",
      "diseases.oidium.condition2",
      "diseases.oidium.condition3",
    ],
    preventiveActions: [
      "diseases.oidium.preventive1",
      "diseases.oidium.preventive2",
      "diseases.oidium.preventive3",
    ],
    curativeActions: [
      "diseases.oidium.curative1",
      "diseases.oidium.curative2",
    ],
    impactedParts: [
      "diseases.oidium.part1",
      "diseases.oidium.part2",
      "diseases.oidium.part3",
    ],
    spreadMethod: "diseases.oidium.spread",
  },
  {
    id: "black_rot",
    name: "diseases.blackRot.name",
    type: "fungal",
    icon: "ellipse",
    iconColor: "#5F5E5A",
    bgColor: "#F1EFE8",
    severity: "high",
    description: "diseases.blackRot.description",
    symptoms: [
      "diseases.blackRot.symptom1",
      "diseases.blackRot.symptom2",
    ],
    treatment: "diseases.blackRot.treatment",
    season: "diseases.blackRot.season",
    images: [
      "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&h=600&fit=crop",
    ],
    timeline: { startMonth: 5, endMonth: 8, peakMonth: 6 },
    conditions: [
      "diseases.blackRot.condition1",
      "diseases.blackRot.condition2",
      "diseases.blackRot.condition3",
    ],
    preventiveActions: [
      "diseases.blackRot.preventive1",
      "diseases.blackRot.preventive2",
      "diseases.blackRot.preventive3",
    ],
    curativeActions: [
      "diseases.blackRot.curative1",
      "diseases.blackRot.curative2",
    ],
    impactedParts: [
      "diseases.blackRot.part1",
      "diseases.blackRot.part2",
      "diseases.blackRot.part3",
    ],
    spreadMethod: "diseases.blackRot.spread",
  },
  {
    id: "esca",
    name: "diseases.esca.name",
    type: "fungal",
    icon: "leaf-outline",
    iconColor: "#993C1D",
    bgColor: "#FAECE7",
    severity: "medium",
    description: "diseases.esca.description",
    symptoms: [
      "diseases.esca.symptom1",
      "diseases.esca.symptom2",
    ],
    treatment: "diseases.esca.treatment",
    season: "diseases.esca.season",
    images: [
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573062337052-54e2d025e7a1?w=800&h=600&fit=crop",
    ],
    timeline: { startMonth: 6, endMonth: 9, peakMonth: 7 },
    conditions: [
      "diseases.esca.condition1",
      "diseases.esca.condition2",
      "diseases.esca.condition3",
    ],
    preventiveActions: [
      "diseases.esca.preventive1",
      "diseases.esca.preventive2",
      "diseases.esca.preventive3",
    ],
    curativeActions: [
      "diseases.esca.curative1",
      "diseases.esca.curative2",
      "diseases.esca.curative3",
    ],
    impactedParts: [
      "diseases.esca.part1",
      "diseases.esca.part2",
      "diseases.esca.part3",
    ],
    spreadMethod: "diseases.esca.spread",
  },
  {
    id: "botrytis",
    name: "diseases.botrytis.name",
    type: "fungal",
    icon: "cloud-outline",
    iconColor: "#185FA5",
    bgColor: "#E6F1FB",
    severity: "medium",
    description: "diseases.botrytis.description",
    symptoms: [
      "diseases.botrytis.symptom1",
      "diseases.botrytis.symptom2",
    ],
    treatment: "diseases.botrytis.treatment",
    season: "diseases.botrytis.season",
    images: [
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1508472697919-afcacb6e1bcc?w=800&h=600&fit=crop",
    ],
    timeline: { startMonth: 7, endMonth: 10, peakMonth: 9 },
    conditions: [
      "diseases.botrytis.condition1",
      "diseases.botrytis.condition2",
      "diseases.botrytis.condition3",
    ],
    preventiveActions: [
      "diseases.botrytis.preventive1",
      "diseases.botrytis.preventive2",
      "diseases.botrytis.preventive3",
    ],
    curativeActions: [
      "diseases.botrytis.curative1",
      "diseases.botrytis.curative2",
    ],
    impactedParts: [
      "diseases.botrytis.part1",
      "diseases.botrytis.part2",
    ],
    spreadMethod: "diseases.botrytis.spread",
  },
  {
    id: "flavescence_doree",
    name: "diseases.flavescence.name",
    type: "bacterial",
    icon: "warning-outline",
    iconColor: "#A32D2D",
    bgColor: "#FCEBEB",
    severity: "high",
    description: "diseases.flavescence.description",
    symptoms: [
      "diseases.flavescence.symptom1",
      "diseases.flavescence.symptom2",
    ],
    treatment: "diseases.flavescence.treatment",
    season: "diseases.flavescence.season",
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566903451935-7bc0ddd0e8e6?w=800&h=600&fit=crop",
    ],
    timeline: { startMonth: 6, endMonth: 10, peakMonth: 8 },
    conditions: [
      "diseases.flavescence.condition1",
      "diseases.flavescence.condition2",
      "diseases.flavescence.condition3",
    ],
    preventiveActions: [
      "diseases.flavescence.preventive1",
      "diseases.flavescence.preventive2",
      "diseases.flavescence.preventive3",
    ],
    curativeActions: [
      "diseases.flavescence.curative1",
      "diseases.flavescence.curative2",
    ],
    impactedParts: [
      "diseases.flavescence.part1",
      "diseases.flavescence.part2",
      "diseases.flavescence.part3",
    ],
    spreadMethod: "diseases.flavescence.spread",
  },
  {
    id: "chlorose",
    name: "diseases.chlorose.name",
    type: "abiotic",
    icon: "sunny-outline",
    iconColor: "#639922",
    bgColor: "#EAF3DE",
    severity: "low",
    description: "diseases.chlorose.description",
    symptoms: [
      "diseases.chlorose.symptom1",
      "diseases.chlorose.symptom2",
    ],
    treatment: "diseases.chlorose.treatment",
    season: "diseases.chlorose.season",
    images: [
      "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&h=600&fit=crop",
    ],
    timeline: { startMonth: 4, endMonth: 7, peakMonth: 5 },
    conditions: [
      "diseases.chlorose.condition1",
      "diseases.chlorose.condition2",
      "diseases.chlorose.condition3",
    ],
    preventiveActions: [
      "diseases.chlorose.preventive1",
      "diseases.chlorose.preventive2",
      "diseases.chlorose.preventive3",
    ],
    curativeActions: [
      "diseases.chlorose.curative1",
      "diseases.chlorose.curative2",
    ],
    impactedParts: [
      "diseases.chlorose.part1",
    ],
    spreadMethod: "diseases.chlorose.spread",
  },
];

export function getDiseaseById(id: string): Disease | undefined {
  return VINE_DISEASES.find((d) => d.id === id);
}
