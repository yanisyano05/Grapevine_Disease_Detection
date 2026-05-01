import { useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ArrowRight, AlertTriangle } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import type { Disease } from "@/data/diseases";

interface LargeDiseaseCardProps {
  disease: Disease;
  onPress: () => void;
  index?: number;
  compact?: boolean;
}

const TYPE_TINT: Record<Disease["type"], { bg: string; fg: string }> = {
  fungal: { bg: "#7B1FA2", fg: "#FFFFFF" },
  bacterial: { bg: "#C62828", fg: "#FFFFFF" },
  pest: { bg: "#EF6C00", fg: "#FFFFFF" },
  abiotic: { bg: "#1565C0", fg: "#FFFFFF" },
};

const SEVERITY_TINT: Record<
  Disease["severity"],
  { bg: string; fg: string; labelKey: string }
> = {
  high: { bg: "#FBE9E7", fg: "#D32F2F", labelKey: "guides.riskLevel.high" },
  medium: { bg: "#FFF8E1", fg: "#F9A825", labelKey: "guides.riskLevel.medium" },
  low: { bg: "#E8F5E9", fg: "#2E7D32", labelKey: "guides.riskLevel.low" },
};

const TYPE_LABEL: Record<Disease["type"], string> = {
  fungal: "diseases.types.fungal",
  bacterial: "diseases.types.bacterial",
  pest: "diseases.types.pest",
  abiotic: "diseases.types.abiotic",
};

export default function LargeDiseaseCard({
  disease,
  onPress,
  index = 0,
  compact = false,
}: LargeDiseaseCardProps) {
  const { t } = useTranslation();
  const type = TYPE_TINT[disease.type];
  const severity = SEVERITY_TINT[disease.severity];

  // Anim manuelle (useSharedValue + useEffect) plutôt que `entering={FadeInDown}`,
  // car Reanimated v4 a un bug où la 1re anim entering d'une liste fraîchement
  // re-renderée (skeleton → data) ne s'applique pas et le card reste invisible.
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = 60 + index * 90;
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 16, stiffness: 120 }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const cardRadius = compact ? 24 : 32;
  const cardClassName = compact
    ? "bg-white p-5 min-h-[220px] justify-between"
    : "bg-white p-6 min-h-[260px] justify-between";
  const headerMb = compact ? "mb-3" : "mb-5";
  const iconCircleClass = compact
    ? "w-9 h-9 bg-[#F8F9FA] rounded-full items-center justify-center"
    : "w-11 h-11 bg-[#F8F9FA] rounded-full items-center justify-center";
  const iconSize = compact ? 20 : 26;
  const titleClass = compact
    ? "text-[18px] font-extrabold text-[#1A1A1A] leading-6 tracking-[-0.3px]"
    : "text-[26px] font-extrabold text-[#1A1A1A] leading-8 tracking-[-0.6px]";
  const descClass = compact
    ? "text-[13px] text-[#4A4A4A] leading-[18px]"
    : "text-sm text-[#4A4A4A] leading-[21px]";
  const descLines = compact ? 2 : 3;
  const footerClass = compact
    ? "flex-row items-center justify-between mt-4 pt-3 border-t border-[#F5F5F5]"
    : "flex-row items-center justify-between mt-6 pt-5 border-t border-[#F5F5F5]";
  const badgeClass = compact
    ? "px-3 py-1 rounded-full"
    : "px-3.5 py-1.5 rounded-full";
  const badgeTextClass = compact
    ? "text-[10px] font-extrabold tracking-[1px]"
    : "text-[11px] font-extrabold tracking-[1.2px]";
  const severityClass = compact
    ? "flex-row items-center gap-1.5 px-3 py-1.5 rounded-2xl"
    : "flex-row items-center gap-2 px-3.5 py-2 rounded-2xl";
  const severityTextClass = compact
    ? "text-[10px] font-extrabold tracking-[0.8px]"
    : "text-[11px] font-extrabold tracking-[1px]";
  const arrowSize = compact ? "w-10 h-10" : "w-12 h-12";
  const arrowIconSize = compact ? 18 : 20;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        className={cardClassName}
        style={({ pressed }) => [
          styles.cardShadow,
          {
            borderRadius: cardRadius,
            borderWidth: 1,
            borderColor: "#EEEEEE",
          },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        {/* Header: type badge + icon */}
        <View className={`flex-row items-center justify-between ${headerMb}`}>
          <View
            className={badgeClass}
            style={{ backgroundColor: type.bg }}
          >
            <Text
              className={badgeTextClass}
              style={{ color: type.fg }}
            >
              {t(TYPE_LABEL[disease.type]).toUpperCase()}
            </Text>
          </View>
          <View className={iconCircleClass}>
            <Ionicons
              name={disease.icon as keyof typeof Ionicons.glyphMap}
              size={iconSize}
              color={disease.iconColor}
            />
          </View>
        </View>

        {/* Content */}
        <View className="gap-2">
          <Text className={titleClass} numberOfLines={2}>
            {t(disease.name)}
          </Text>
          <Text className={descClass} numberOfLines={descLines}>
            {t(disease.description)}
          </Text>
        </View>

        {/* Footer: severity tag + arrow button */}
        <View className={footerClass}>
          <View
            className={severityClass}
            style={{ backgroundColor: severity.bg }}
          >
            <AlertTriangle size={compact ? 12 : 14} color={severity.fg} strokeWidth={2.5} />
            <Text
              className={severityTextClass}
              style={{ color: severity.fg }}
            >
              {t(severity.labelKey).toUpperCase()}
            </Text>
          </View>

          <View
            className={`${arrowSize} rounded-full items-center justify-center`}
            style={[
              styles.arrowShadow,
              { backgroundColor: colors.primary[800] },
            ]}
          >
            <ArrowRight size={arrowIconSize} color="#FFFFFF" strokeWidth={2.6} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },
  arrowShadow: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
