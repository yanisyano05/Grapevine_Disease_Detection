import { useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import Skeleton from "@/components/ui/Skeleton";
import { useGuideDetail } from "@/hooks/useGuideDetail";
import type { GuideSection } from "@/data/guides";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "GuideDetail">;

const CATEGORY_LABELS: Record<string, { fr: string; en: string }> = {
  beginner: { fr: "Débutant", en: "Beginner" },
  treatment: { fr: "Traitement", en: "Treatment" },
  varieties: { fr: "Cépages", en: "Varieties" },
  seasonal: { fr: "Saisonnier", en: "Seasonal" },
};

export default function GuideDetailScreen({ route }: Props) {
  const { guideId } = route.params;
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { guide, isLoading } = useGuideDetail(guideId);

  // Entry animation
  const contentY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (guide) {
      const timing = { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
      contentY.value = withTiming(0, timing);
      contentOpacity.value = withTiming(1, timing);
    }
  }, [guide]);

  const contentAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  if (isLoading && !guide) {
    return (
      <View style={styles.centered}>
        <Skeleton width={200} height={24} borderRadius={8} />
      </View>
    );
  }

  if (!guide) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#1A1A1A" }}>Guide introuvable</Text>
      </View>
    );
  }

  const lang = i18n.language === "en" ? "en" : "fr";
  const catLabel = CATEGORY_LABELS[guide.category]?.[lang] ?? guide.category;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Image ── */}
        <View style={styles.heroContainer}>
          {guide.image ? (
            <Image
              source={{ uri: guide.image }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: guide.bgColor, alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name={guide.icon as any} size={80} color={guide.iconColor} />
            </View>
          )}
          <LinearGradient colors={["rgba(0,0,0,0.35)", "transparent"]} style={styles.gradientTop} />
          <LinearGradient colors={["transparent", "#F8F9FB"]} style={styles.gradientBottom} />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Read time badge */}
          <View style={[styles.readTimeBadge, { top: insets.top + 8 }]}>
            <Ionicons name="time-outline" size={14} color="#1A1A1A" />
            <Text style={styles.readTimeText}>
              {t("common.readTime", { min: guide.readTime })}
            </Text>
          </View>
        </View>

        {/* ── Content ── */}
        <Animated.View style={contentAnim}>
          {/* Title */}
          <Text style={styles.title}>{t(guide.title)}</Text>
          <Text style={styles.subtitle}>{t(guide.subtitle)}</Text>

          {/* Category pill */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{catLabel}</Text>
            </View>
          </View>

          {/* Sections */}
          {guide.content.map((section, index) => (
            <View key={index}>
              {/* Separator (except before first) */}
              {index > 0 && <View style={styles.separator} />}

              <SectionBlock section={section} t={t} />
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ── Section Block ── */

function SectionBlock({ section, t }: { section: GuideSection; t: (key: string) => string }) {
  return (
    <>
      <Text style={styles.sectionTitle}>{t(section.title)}</Text>
      <Text style={styles.sectionBody}>{t(section.body)}</Text>

      {/* Section image */}
      {section.image && (
        <View style={styles.sectionImageWrapper}>
          <Image
            source={{ uri: section.image }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={200}
          />
        </View>
      )}

      {/* Tip card */}
      {section.tip && (
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={18} color="#2D6A4F" />
            <Text style={styles.tipLabel}>Conseil</Text>
          </View>
          <Text style={styles.tipText}>{t(section.tip)}</Text>
        </View>
      )}
    </>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FB",
  },

  // Hero
  heroContainer: {
    height: 280,
    position: "relative",
    backgroundColor: "#E0E0E0",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  readTimeBadge: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  readTimeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    paddingHorizontal: 20,
    marginTop: -8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#8E8E93",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  categoryRow: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(45, 106, 79, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D6A4F",
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 20,
    marginTop: 32,
  },

  // Sections
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 26,
    color: "#444444",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionImageWrapper: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#E0E0E0",
  },

  // Tip
  tipCard: {
    backgroundColor: "rgba(45, 106, 79, 0.06)",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#2D6A4F",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D6A4F",
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#2D6A4F",
  },
});
