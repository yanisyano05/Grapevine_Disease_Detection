import { View, FlatList, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { colors } from "@/theme/colors";
import { VINE_DISEASES } from "@/data/diseases";
import type { Disease } from "@/data/diseases";

const DISEASE_TYPE_KEYS: Record<Disease["type"], string> = {
  fungal: "diseases.types.fungal",
  bacterial: "diseases.types.bacterial",
  pest: "diseases.types.pest",
  abiotic: "diseases.types.abiotic",
};

const SEVERITY_LEVELS: Record<Disease["severity"], { color: string; label: string }> = {
  high: { color: "#EF4444", label: "high" },
  medium: { color: "#F59E0B", label: "medium" },
  low: { color: "#10B981", label: "low" },
};

export default function FrequentDiseases() {
  const { t } = useTranslation();

  return (
    <FlatList
      data={VINE_DISEASES}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => {
        const severity = SEVERITY_LEVELS[item.severity];

        return (
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.card, { shadowColor: item.iconColor }]}
          >
            {/* Header: Icon & Severity Badge */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: `${item.iconColor}15` }]}>
                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
              </View>
              
              <View style={[styles.severityBadge, { backgroundColor: `${severity.color}15` }]}>
                <View style={[styles.dot, { backgroundColor: severity.color }]} />
              </View>
            </View>

            {/* Content */}
            <View style={styles.cardBody}>
              <Text style={styles.typeText}>
                {t(DISEASE_TYPE_KEYS[item.type]).toUpperCase()}
              </Text>
              <Text numberOfLines={2} style={styles.nameText}>
                {t(item.name)}
              </Text>
            </View>

            {/* Footer: Action hint */}
            <View style={styles.cardFooter}>
               <Text style={styles.moreInfo}>{t("common.details")}</Text>
               <Ionicons name="chevron-forward" size={12} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 16,
  },
  card: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
    // Shadow logic
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
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
  }
});