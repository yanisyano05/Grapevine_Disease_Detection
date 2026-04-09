import type { ApiDisease } from "./diseases";
import type { ApiGuide } from "./guides";
import type { Disease } from "@/data/diseases";
import type { Guide, GuideSection } from "@/data/guides";

// ── Slug → i18n key mapping ──

const DISEASE_SLUG_MAP: Record<string, string> = {
  mildiou: "mildiou",
  oidium: "oidium",
  "black-rot": "blackRot",
  esca: "esca",
  botrytis: "botrytis",
  "flavescence-doree": "flavescence",
  "chlorose-ferrique": "chlorose",
};

const GUIDE_SLUG_MAP: Record<string, string> = {
  "reconnaitre-feuille-saine": "healthyLeaf",
  "calendrier-traitement": "treatmentCalendar",
  "cepages-bordelais": "grapeVarieties",
};

function slugToCamel(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// ── Disease mapper ──

export function mapApiDiseaseToLocal(api: ApiDisease): Disease {
  const key = DISEASE_SLUG_MAP[api.slug] ?? slugToCamel(api.slug);

  // Build images array: prefer relation images, fallback to imageUrl
  const images = api.images.length > 0
    ? api.images.sort((a, b) => a.order - b.order).map((i) => i.url)
    : api.imageUrl
      ? [api.imageUrl]
      : [];

  // Build symptom i18n keys
  const symptoms = api.symptoms.map((_, i) => `diseases.${key}.symptom${i + 1}`);

  // Build detail array i18n keys
  const conditions = api.conditions.map((_, i) => `diseases.${key}.condition${i + 1}`);
  const preventiveActions = api.preventiveActions.map((_, i) => `diseases.${key}.preventive${i + 1}`);
  const curativeActions = api.curativeActions.map((_, i) => `diseases.${key}.curative${i + 1}`);
  const impactedParts = api.impactedParts.map((_, i) => `diseases.${key}.part${i + 1}`);

  return {
    id: api.slug.replace(/-/g, "_"),
    name: `diseases.${key}.name`,
    type: api.type.toLowerCase() as Disease["type"],
    icon: mapIconName(api.iconName),
    iconColor: api.iconColor,
    bgColor: api.bgColor,
    severity: api.severity.toLowerCase() as Disease["severity"],
    description: `diseases.${key}.description`,
    symptoms,
    treatment: `diseases.${key}.treatment`,
    season: `diseases.${key}.season`,
    images,
    timeline: {
      startMonth: api.startMonth ?? 5,
      endMonth: api.endMonth ?? 9,
      peakMonth: api.peakMonth ?? 7,
    },
    conditions,
    preventiveActions,
    curativeActions,
    impactedParts,
    spreadMethod: `diseases.${key}.spread`,
  };
}

// Map Lucide icon names (backend) to Ionicons (mobile)
function mapIconName(name: string): string {
  const MAP: Record<string, string> = {
    droplets: "water-outline",
    wind: "snow-outline",
    circle: "ellipse",
    "tree-deciduous": "leaf-outline",
    "cloud-rain": "cloud-outline",
    bug: "warning-outline",
    leaf: "sunny-outline",
  };
  return MAP[name] ?? name;
}

// ── Guide mapper ──

export function mapApiGuideToLocal(api: ApiGuide): Guide {
  const key = GUIDE_SLUG_MAP[api.slug] ?? slugToCamel(api.slug);

  // Map sections from API (direct text, not i18n keys)
  const sections: GuideSection[] = api.sections
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      title: s.title,
      body: s.body,
      image: s.image ?? undefined,
      tip: s.tip ?? undefined,
    }));

  // Map category to the local union type
  const CATEGORY_MAP: Record<string, Guide["category"]> = {
    diagnostic: "beginner",
    traitement: "treatment",
    cepages: "varieties",
    general: "beginner",
  };

  return {
    id: api.slug.replace(/-/g, "_"),
    title: `guides.${key}.title`,
    subtitle: `guides.${key}.subtitle`,
    icon: mapIconName(api.iconName),
    iconColor: api.iconColor,
    bgColor: api.bgColor,
    category: CATEGORY_MAP[api.category] ?? "beginner",
    readTime: api.readTime ?? 5,
    image: api.coverImage ?? "",
    content: sections.length > 0 ? sections : [],
  };
}
