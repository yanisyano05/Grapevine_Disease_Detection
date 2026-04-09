export interface GuideSection {
  title: string;
  body: string;
  image?: string;
  tip?: string;
}

export interface Guide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  // Detail fields
  category: "beginner" | "treatment" | "varieties" | "seasonal";
  readTime: number;
  image: string;
  content: GuideSection[];
}

export const PRACTICAL_GUIDES: Guide[] = [
  {
    id: "healthy_leaf",
    title: "guides.healthyLeaf.title",
    subtitle: "guides.healthyLeaf.subtitle",
    icon: "happy-outline",
    iconColor: "#1D9E75",
    bgColor: "#E1F5EE",
    category: "beginner",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1596142780450-01a1f79c400c?w=800&h=600&fit=crop",
    content: [
      {
        title: "guides.healthyLeaf.sections.colorTexture.title",
        body: "guides.healthyLeaf.sections.colorTexture.body",
        image: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&h=600&fit=crop",
        tip: "guides.healthyLeaf.sections.colorTexture.tip",
      },
      {
        title: "guides.healthyLeaf.sections.shape.title",
        body: "guides.healthyLeaf.sections.shape.body",
      },
      {
        title: "guides.healthyLeaf.sections.warning.title",
        body: "guides.healthyLeaf.sections.warning.body",
        tip: "guides.healthyLeaf.sections.warning.tip",
      },
    ],
  },
  {
    id: "treatment_calendar",
    title: "guides.treatmentCalendar.title",
    subtitle: "guides.treatmentCalendar.subtitle",
    icon: "book-outline",
    iconColor: "#185FA5",
    bgColor: "#E6F1FB",
    category: "treatment",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop",
    content: [
      {
        title: "guides.treatmentCalendar.sections.winter.title",
        body: "guides.treatmentCalendar.sections.winter.body",
      },
      {
        title: "guides.treatmentCalendar.sections.spring.title",
        body: "guides.treatmentCalendar.sections.spring.body",
        tip: "guides.treatmentCalendar.sections.spring.tip",
      },
      {
        title: "guides.treatmentCalendar.sections.summer.title",
        body: "guides.treatmentCalendar.sections.summer.body",
        tip: "guides.treatmentCalendar.sections.summer.tip",
      },
      {
        title: "guides.treatmentCalendar.sections.autumn.title",
        body: "guides.treatmentCalendar.sections.autumn.body",
      },
    ],
  },
  {
    id: "grape_varieties",
    title: "guides.grapeVarieties.title",
    subtitle: "guides.grapeVarieties.subtitle",
    icon: "wine-outline",
    iconColor: "#534AB7",
    bgColor: "#EEEDFE",
    category: "varieties",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&h=600&fit=crop",
    content: [
      {
        title: "guides.grapeVarieties.sections.reds.title",
        body: "guides.grapeVarieties.sections.reds.body",
      },
      {
        title: "guides.grapeVarieties.sections.whites.title",
        body: "guides.grapeVarieties.sections.whites.body",
      },
      {
        title: "guides.grapeVarieties.sections.choosing.title",
        body: "guides.grapeVarieties.sections.choosing.body",
        tip: "guides.grapeVarieties.sections.choosing.tip",
      },
    ],
  },
];

export function getGuideById(id: string): Guide | undefined {
  return PRACTICAL_GUIDES.find((g) => g.id === id);
}
