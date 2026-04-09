import {
  Leaf,
  Calendar,
  Grape,
  BookOpen,
  HelpCircle,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

export interface GuideVisual {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

const GUIDE_VISUALS: Record<string, GuideVisual> = {
  beginner: {
    icon: Leaf,
    iconColor: "#059669",
    bgColor: "#D1FAE5",
  },
  treatment: {
    icon: Calendar,
    iconColor: "#2563EB",
    bgColor: "#DBEAFE",
  },
  varieties: {
    icon: Grape,
    iconColor: "#7C3AED",
    bgColor: "#F3E8FF",
  },
  seasonal: {
    icon: Calendar,
    iconColor: "#D97706",
    bgColor: "#FEF3C7",
  },
  general: {
    icon: BookOpen,
    iconColor: "#6B7280",
    bgColor: "#F3F4F6",
  },
};

const DEFAULT_VISUAL: GuideVisual = {
  icon: HelpCircle,
  iconColor: "#6B7280",
  bgColor: "#F3F4F6",
};

export function getGuideVisual(category: string): GuideVisual {
  return GUIDE_VISUALS[category?.toLowerCase()] ?? DEFAULT_VISUAL;
}
