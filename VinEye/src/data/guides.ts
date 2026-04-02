export interface Guide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

export const PRACTICAL_GUIDES: Guide[] = [
  {
    id: "healthy_leaf",
    title: "guides.healthyLeaf.title",
    subtitle: "guides.healthyLeaf.subtitle",
    icon: "happy-outline",
    iconColor: "#1D9E75",
    bgColor: "#E1F5EE",
  },
  {
    id: "treatment_calendar",
    title: "guides.treatmentCalendar.title",
    subtitle: "guides.treatmentCalendar.subtitle",
    icon: "book-outline",
    iconColor: "#185FA5",
    bgColor: "#E6F1FB",
  },
  {
    id: "grape_varieties",
    title: "guides.grapeVarieties.title",
    subtitle: "guides.grapeVarieties.subtitle",
    icon: "wine-outline",
    iconColor: "#534AB7",
    bgColor: "#EEEDFE",
  },
];
