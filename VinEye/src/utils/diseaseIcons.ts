import {
  Droplets,
  Snowflake,
  CircleDot,
  Skull,
  CloudRain,
  Leaf,
  Sun,
  AlertTriangle,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

export interface DiseaseVisual {
  icon: LucideIcon;
  iconColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  borderGradientStart: string;
  borderGradientEnd: string;
}

const DISEASE_VISUALS: Record<string, DiseaseVisual> = {
  mildiou: {
    icon: Droplets,
    iconColor: "#E67E22",
    bgGradientStart: "#FFF5EB",
    bgGradientEnd: "#FFE8D1",
    borderGradientStart: "#FFD6A5",
    borderGradientEnd: "#FFBD73",
  },
  oidium: {
    icon: Snowflake,
    iconColor: "#3B82F6",
    bgGradientStart: "#EFF6FF",
    bgGradientEnd: "#DBEAFE",
    borderGradientStart: "#BFDBFE",
    borderGradientEnd: "#93C5FD",
  },
  black_rot: {
    icon: CircleDot,
    iconColor: "#1F2937",
    bgGradientStart: "#F3F4F6",
    bgGradientEnd: "#E5E7EB",
    borderGradientStart: "#D1D5DB",
    borderGradientEnd: "#9CA3AF",
  },
  esca: {
    icon: Skull,
    iconColor: "#8B5CF6",
    bgGradientStart: "#F5F3FF",
    bgGradientEnd: "#EDE9FE",
    borderGradientStart: "#DDD6FE",
    borderGradientEnd: "#C4B5FD",
  },
  botrytis: {
    icon: CloudRain,
    iconColor: "#6B7280",
    bgGradientStart: "#F9FAFB",
    bgGradientEnd: "#F3F4F6",
    borderGradientStart: "#E5E7EB",
    borderGradientEnd: "#D1D5DB",
  },
  flavescence_doree: {
    icon: Leaf,
    iconColor: "#F59E0B",
    bgGradientStart: "#FFFBEB",
    bgGradientEnd: "#FEF3C7",
    borderGradientStart: "#FDE68A",
    borderGradientEnd: "#FCD34D",
  },
  chlorose: {
    icon: Sun,
    iconColor: "#10B981",
    bgGradientStart: "#ECFDF5",
    bgGradientEnd: "#D1FAE5",
    borderGradientStart: "#A7F3D0",
    borderGradientEnd: "#6EE7B7",
  },
};

const DEFAULT_VISUAL: DiseaseVisual = {
  icon: AlertTriangle,
  iconColor: "#6B7280",
  bgGradientStart: "#F9FAFB",
  bgGradientEnd: "#F3F4F6",
  borderGradientStart: "#E5E7EB",
  borderGradientEnd: "#D1D5DB",
};

export function getDiseaseVisual(id: string): DiseaseVisual {
  return DISEASE_VISUALS[id] ?? DEFAULT_VISUAL;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "high":
      return "#EF4444";
    case "medium":
      return "#F59E0B";
    case "low":
      return "#22C55E";
    default:
      return "#6B7280";
  }
}
