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
import SeasonTimeline from "@/components/disease/SeasonTimeline";
import { useDiseaseDetail } from "@/hooks/useDiseaseDetail";
import type { Disease } from "@/data/diseases";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "DiseaseDetail">;

const SEVERITY_COLORS: Record<Disease["severity"], { bg: string; label: string }> = {
  high: { bg: "rgba(239, 68, 68, 0.9)", label: "guides.severity.critical" },
  medium: { bg: "rgba(245, 158, 11, 0.9)", label: "guides.severity.moderate" },
  low: { bg: "rgba(34, 197, 94, 0.9)", label: "guides.severity.low" },
};

const TYPE_ICONS: Record<string, string> = {
  fungal: "leaf-outline",
  bacterial: "bug-outline",
  pest: "bug-outline",
  abiotic: "sunny-outline",
};

export default function DiseaseDetailScreen({ route }: Props) {
  const { diseaseId } = route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { disease, isLoading } = useDiseaseDetail(diseaseId);

  // Entry animation
  const contentY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (disease) {
      const timing = { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
      contentY.value = withTiming(0, timing);
      contentOpacity.value = withTiming(1, timing);
    }
  }, [disease]);

  const contentAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  if (isLoading && !disease) {
    return (
      <View style={styles.centered}>
        <Skeleton width={200} height={24} borderRadius={8} />
      </View>
    );
  }

  if (!disease) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#1A1A1A" }}>Maladie introuvable</Text>
      </View>
    );
  }

  const severity = SEVERITY_COLORS[disease.severity];
  const heroImage = disease.images[0];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Image ── */}
        <View style={styles.heroContainer}>
          {heroImage ? (
            <Image
              source={{ uri: heroImage }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: disease.bgColor, alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name={disease.icon as any} size={80} color={disease.iconColor} />
            </View>
          )}
          {/* Top gradient (status bar readability) */}
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "transparent"]}
            style={styles.gradientTop}
          />
          {/* Bottom gradient (transition to content) */}
          <LinearGradient
            colors={["transparent", "#F8F9FB"]}
            style={styles.gradientBottom}
          />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Severity badge */}
          <View style={[styles.severityBadge, { top: insets.top + 8, backgroundColor: severity.bg }]}>
            <Text style={styles.severityText}>{t(severity.label)}</Text>
          </View>
        </View>

        {/* ── Content ── */}
        <Animated.View style={contentAnim}>
          {/* Title */}
          <Text style={styles.title}>{t(disease.name)}</Text>

          {/* Meta pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metaRow}
          >
            <View style={styles.metaPill}>
              <Ionicons name={TYPE_ICONS[disease.type] as any} size={14} color="#2D6A4F" />
              <Text style={styles.metaPillText}>
                {t(`diseases.types.${disease.type}`)}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="calendar-outline" size={14} color="#2D6A4F" />
              <Text style={styles.metaPillText} numberOfLines={1}>
                {t(disease.season)}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="leaf-outline" size={14} color="#2D6A4F" />
              <Text style={styles.metaPillText}>
                {disease.impactedParts.map((p) => t(p)).join(", ")}
              </Text>
            </View>
          </ScrollView>

          {/* Description */}
          <SectionTitle icon="information-circle-outline" label={t("common.details")} />
          <Text style={styles.bodyText}>{t(disease.description)}</Text>

          {/* Timeline */}
          <SectionTitle icon="time-outline" label={t("common.timeline")} />
          <View style={styles.sectionPad}>
            <SeasonTimeline
              startMonth={disease.timeline.startMonth}
              endMonth={disease.timeline.endMonth}
              peakMonth={disease.timeline.peakMonth}
              activeColor={disease.iconColor}
            />
          </View>

          {/* Conditions */}
          <SectionTitle icon="thermometer-outline" label={t("common.conditions")} />
          <View style={styles.tagsContainer}>
            {disease.conditions.map((c, i) => (
              <View key={i} style={styles.conditionTag}>
                <Text style={styles.conditionText}>{t(c)}</Text>
              </View>
            ))}
          </View>

          {/* Symptoms */}
          <SectionTitle icon="eye-outline" label="Symptômes" />
          <View style={styles.sectionPad}>
            {disease.symptoms.map((s, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{t(s)}</Text>
              </View>
            ))}
          </View>

          {/* Preventive Actions */}
          <SectionTitle icon="shield-checkmark-outline" label={t("common.prevention")} />
          <View style={styles.sectionPad}>
            {disease.preventiveActions.map((a, i) => (
              <View key={i} style={styles.actionCard}>
                <View style={styles.actionNumber}>
                  <Text style={styles.actionNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.actionText}>{t(a)}</Text>
              </View>
            ))}
          </View>

          {/* Curative Actions */}
          <SectionTitle icon="medkit-outline" label={t("common.curativeActions")} />
          <View style={styles.sectionPad}>
            {disease.curativeActions.map((a, i) => (
              <View key={i} style={styles.actionCardOrange}>
                <View style={styles.actionNumberOrange}>
                  <Text style={styles.actionNumberOrangeText}>{i + 1}</Text>
                </View>
                <Text style={styles.actionText}>{t(a)}</Text>
              </View>
            ))}
          </View>

          {/* Spread Method */}
          <SectionTitle icon="swap-horizontal-outline" label={t("common.spreadMethod")} />
          <View style={styles.sectionPad}>
            <View style={styles.spreadCard}>
              <Ionicons name="warning-outline" size={20} color="#B91C1C" />
              <Text style={styles.spreadText}>{t(disease.spreadMethod)}</Text>
            </View>
          </View>

          {/* Photo Gallery */}
          {disease.images.length > 1 && (
            <>
              <SectionTitle icon="images-outline" label="Photos" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gallery}
              >
                {disease.images.map((uri, i) => (
                  <View key={i} style={styles.galleryItem}>
                    <Image
                      source={{ uri }}
                      style={StyleSheet.absoluteFillObject}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ── Inline SectionTitle ── */

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon as any} size={20} color="#2D6A4F" />
      <Text style={styles.sectionTitleText}>{label}</Text>
    </View>
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
    height: 320,
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
  severityBadge: {
    position: "absolute",
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Title + meta
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    paddingHorizontal: 20,
    marginTop: -8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(45, 106, 79, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  metaPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D6A4F",
  },

  // Section titles
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  // Body
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#444444",
    paddingHorizontal: 20,
  },
  sectionPad: {
    paddingHorizontal: 20,
  },

  // Conditions tags
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
  },
  conditionTag: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B45309",
  },

  // Symptoms bullets
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2D6A4F",
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#333333",
  },

  // Action cards (preventive — green)
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(45, 106, 79, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D6A4F",
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
  },

  // Action cards (curative — orange)
  actionCardOrange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  actionNumberOrange: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionNumberOrangeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
  },

  // Spread
  spreadCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: 16,
    padding: 16,
  },
  spreadText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#7F1D1D",
  },

  // Gallery
  gallery: {
    paddingHorizontal: 20,
    gap: 12,
  },
  galleryItem: {
    width: 160,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },
});
