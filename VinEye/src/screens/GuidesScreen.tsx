import { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { VINE_DISEASES } from "@/data/diseases";
import { PRACTICAL_GUIDES } from "@/data/guides";
import type { Disease } from "@/data/diseases";
import type { Guide } from "@/data/guides";

type Tab = "diseases" | "guides";

const DISEASE_TYPE_KEYS: Record<Disease["type"], string> = {
  fungal: "diseases.types.fungal",
  bacterial: "diseases.types.bacterial",
  pest: "diseases.types.pest",
  abiotic: "diseases.types.abiotic",
};

const SEVERITY_CONFIG: Record<
  Disease["severity"],
  { label: string; color: string; bg: string }
> = {
  high: { label: "guides.severity.critical", color: "#DC2626", bg: "#FEF2F2" },
  medium: { label: "guides.severity.moderate", color: "#F59E0B", bg: "#FFFBEB" },
  low: { label: "guides.severity.low", color: "#10B981", bg: "#ECFDF5" },
};

function DiseaseCard({ item }: { item: Disease }) {
  const { t } = useTranslation();
  const severity = SEVERITY_CONFIG[item.severity];

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.diseaseCard}>
      {/* Image placeholder */}
      <View style={[styles.diseaseBanner, { backgroundColor: item.bgColor }]}>
        <Ionicons name={item.icon as any} size={36} color={item.iconColor} />
        {/* Severity badge */}
        <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
          <View style={[styles.severityDot, { backgroundColor: severity.color }]} />
          <Text style={[styles.severityText, { color: severity.color }]}>
            {t(severity.label)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.diseaseContent}>
        <View style={[styles.typePill, { backgroundColor: `${item.iconColor}12` }]}>
          <Text style={[styles.typeText, { color: item.iconColor }]}>
            {t(DISEASE_TYPE_KEYS[item.type])}
          </Text>
        </View>
        <Text style={styles.diseaseName} numberOfLines={1}>
          {t(item.name)}
        </Text>
        <Text style={styles.diseaseSeason} numberOfLines={1}>
          {t(item.season)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function GuideCard({ item }: { item: Guide }) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.guideCard}>
      <View style={[styles.guideIcon, { backgroundColor: `${item.iconColor}12` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
      </View>
      <View style={styles.guideText}>
        <Text style={styles.guideTitle} numberOfLines={1}>
          {t(item.title)}
        </Text>
        <Text style={styles.guideSubtitle} numberOfLines={1}>
          {t(item.subtitle)}
        </Text>
      </View>
      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={14} color="#D1D1D6" />
      </View>
    </TouchableOpacity>
  );
}

export default function GuidesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>("diseases");

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate("Main");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("guides.screenTitle")}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Segmented Control */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "diseases" && styles.tabActive]}
            onPress={() => setActiveTab("diseases")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "diseases" && styles.tabTextActive,
              ]}
            >
              {t("guides.tabDiseases")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "guides" && styles.tabActive]}
            onPress={() => setActiveTab("guides")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "guides" && styles.tabTextActive,
              ]}
            >
              {t("guides.tabGuides")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === "diseases" ? (
        <FlatList
          data={VINE_DISEASES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DiseaseCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <FlatList
          data={PRACTICAL_GUIDES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GuideCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.4,
  },

  // Tabs
  tabContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#EEEFF1",
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  tabTextActive: {
    color: "#1A1A1A",
    fontWeight: "600",
  },

  // List
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Disease card
  diseaseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  diseaseBanner: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  severityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  diseaseContent: {
    padding: 16,
  },
  typePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  diseaseSeason: {
    fontSize: 12,
    fontWeight: "400",
    color: "#8E8E93",
  },

  // Guide card
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  guideIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  guideText: {
    flex: 1,
    marginLeft: 14,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  guideSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8E8E93",
  },
  chevronWrap: {
    marginLeft: 8,
    backgroundColor: "#F8F9FA",
    padding: 6,
    borderRadius: 12,
  },
});
