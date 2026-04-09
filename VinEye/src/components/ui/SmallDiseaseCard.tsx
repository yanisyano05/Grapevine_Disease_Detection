import { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import DiseaseIconBadge from "@/components/ui/DiseaseIconBadge";
import { colors } from "@/theme/colors";
import { getDiseaseVisual, getSeverityColor } from "@/utils/diseaseIcons";
import type { Disease } from "@/data/diseases";

interface SmallDiseaseCardProps {
  disease: Disease;
  onPress: () => void;
  index?: number;
  size?: "carousel" | "grid";
}

const DISEASE_TYPE_KEYS: Record<Disease["type"], string> = {
  fungal: "diseases.types.fungal",
  bacterial: "diseases.types.bacterial",
  pest: "diseases.types.pest",
  abiotic: "diseases.types.abiotic",
};

export default function SmallDiseaseCard({
  disease,
  onPress,
  index = 0,
  size = "carousel",
}: SmallDiseaseCardProps) {
  const { t } = useTranslation();
  const visual = getDiseaseVisual(disease.id);
  const severityColor = getSeverityColor(disease.severity);

  // Stagger fade-in
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(20);

  useEffect(() => {
    const delay = index * 80;
    cardOpacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    cardY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 150 }));
  }, []);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  // Severity dot pulse
  const dotScale = useSharedValue(0);
  useEffect(() => {
    dotScale.value = withDelay(
      index * 80 + 200,
      withSpring(1, { damping: 8, stiffness: 300 }),
    );
  }, []);
  const dotAnim = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const isGrid = size === "grid";

  return (
    <Animated.View style={[cardAnim, isGrid && styles.gridWrapper]}>
      <LinearGradient
        colors={[visual.borderGradientStart, visual.borderGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={[
            styles.card,
            { shadowColor: disease.iconColor },
            isGrid && styles.cardGrid,
          ]}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <DiseaseIconBadge
              diseaseId={disease.id}
              size="sm"
              staggerIndex={index}
            />
            <View style={[styles.severityBadge, { backgroundColor: `${severityColor}15` }]}>
              <Animated.View
                style={[styles.dot, { backgroundColor: severityColor }, dotAnim]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.cardBody}>
            <Text style={styles.typeText}>
              {t(DISEASE_TYPE_KEYS[disease.type]).toUpperCase()}
            </Text>
            <Text numberOfLines={1} style={styles.nameText}>
              {t(disease.name)}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.moreInfo}>{t("common.details")}</Text>
            <ChevronRight size={12} color={colors.neutral[400]} strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gridWrapper: {
    flex: 1,
  },
  borderGradient: {
    borderRadius: 26,
    padding: 1.5,
  },
  card: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  cardGrid: {
    width: "auto" as unknown as number,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  severityBadge: {
    padding: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardBody: {
    flex: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.neutral[400],
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  moreInfo: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[400],
  },
});
